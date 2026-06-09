import {
      atsApiRateLimiter,
      atsApiSemaphore,
      isRetryableLLM,
      llmBreaker,
      llmSemaphore,
      withRetry,
} from "../concurrency";
import type { JobFinderConfig } from "../config";
import type { EvaluationFilter } from "../config/evaluation";
import { logger } from "../logger";
import { atsStructuralFilter, fetchAtsData, formatAtsBlock } from "../services/ats";
import { insertJob, type ResilientNotionClient } from "../services/notion";
import type { NotionCacheUpdater } from "../services/notionCache";
import type { TokenTracker } from "../services/tokenTracker";
import type { JobListing } from "../types";
import { checkFuzzyDuplicate } from "./dedup";
import type { DiscoveredJob } from "./discover";
import { enrichJob } from "./enrich";
import { evaluateJob } from "./evaluate";
import { detectSource } from "./scrape";
import { structuralFilter } from "./structuralFilter";

const log = logger.child({ component: "processUrl" });

export type ProcessResult =
      | "inserted"
  | "rejected"
  | "duplicated"
  | "skipped"
  | "companyApplied"
  | "archived"
  | "errored";

export interface ScrapeStats {
      inserted: number;
      skipped: number;
      companyApplied: number;
      rejected: number;
      archived: number;
      duplicated: number;
      errored: number;
}

export interface ProcessContext {
      notion: ResilientNotionClient;
      config: JobFinderConfig;
      syncer: NotionCacheUpdater;
      seenUrls: Set<string>;
      tracker?: TokenTracker;
      filters?: EvaluationFilter[];
}

export async function processDiscoveredJob(
      job: DiscoveredJob,
      ctx: ProcessContext,
    ): Promise<ProcessResult> {
      const { notion, config, syncer, seenUrls, tracker } = ctx;
      const cache = syncer.cache;

  if (seenUrls.has(job.url)) return "skipped";
      seenUrls.add(job.url);

  if (cache.existingUrls.has(job.url)) {
          log.debug({ url: job.url }, "skipped (exists in cache)");
          return "skipped";
  }

  if (cache.blockedCompanies.has(job.company)) {
          log.info({ url: job.url, company: job.company }, "skipped (company blocked)");
          return "skipped";
  }

  if (cache.recentAppCompanies.has(job.company)) {
          log.info({ url: job.url, company: job.company }, "skipped (applied recently)");
          return "companyApplied";
  }

  const listing: JobListing = {
          title: job.title,
          company: job.company,
          url: job.url,
          source: detectSource(job.url),
          keywordsMatched: [job.keyword],
          datePosted: null,
          dateScraped: new Date().toISOString().split("T")[0] ?? "",
          description: job.description,
          location: job.location,
          profile: "",
  };

  // ATS enrichment
  if (config.enableAtsEnrichment) {
          const atsData = await atsApiSemaphore.run(() =>
                    atsApiRateLimiter.run(() => fetchAtsData(job.url, { title: job.title })),
                                                        );
          if (atsData) {
                    log.debug({ url: job.url, source: atsData.source }, "ats enriched");
                    listing.description = `${formatAtsBlock(atsData)}\n\n${listing.description}`;
                    const atsCheck = atsStructuralFilter(atsData);
                    if (!atsCheck.pass) {
                                log.info(
                                    { url: job.url, title: listing.title, company: listing.company, reason: atsCheck.reason },
                                              "rejected (ats)",
                                            );
                                await insertJob(notion, config.notionDatabaseId, listing, "Auto-Rejected");
                                return "rejected";
                    }
          }
  }

  const structural = structuralFilter(listing);
      if (!structural.pass) {
              log.info(
                  { url: job.url, title: listing.title, company: listing.company, reason: structural.reason },
                        "rejected (structural)",
                      );
              await insertJob(notion, config.notionDatabaseId, listing, "Auto-Rejected");
              return "rejected";
      }

  const evaluation = await llmSemaphore.run(() =>
          llmBreaker.run(() =>
                    withRetry(
                                () =>
                                              evaluateJob(listing, config.geminiApiKey, {
                                                              tracker,
                                                              filters: ctx.filters,
                                                              model: config.llmModel,
                                              }),
                        {
                                      shouldRetry: isRetryableLLM,
                                      onRetry: (a) => log.warn({ url: job.url, attempt: a }, "llm eval retry"),
                        },
                              ),
                             ),
                                              );

  if (evaluation.profileName) listing.profile = evaluation.profileName;

  if (!evaluation.pass) {
          log.info(
              { url: job.url, title: listing.title, company: listing.company, reason: evaluation.reason },
                    "rejected",
                  );
          await insertJob(notion, config.notionDatabaseId, listing, "Auto-Rejected");
          return "rejected";
  }

  const enriched = await llmSemaphore.run(() =>
          llmBreaker.run(() =>
                    withRetry(
                                () => enrichJob(listing, config.geminiApiKey, tracker, config.llmModel),
                        {
                                      shouldRetry: isRetryableLLM,
                                      onRetry: (a) => log.warn({ url: job.url, attempt: a }, "llm enrich retry"),
                        },
                              ),
                             ),
                                            );
      listing.title = enriched.title;
      listing.company = enriched.company;
      listing.description = enriched.description;
      listing.location = enriched.location;

  // Fuzzy dedup
  const existingTitles = cache.jobsByCompany.get(listing.company) ?? [];
      if (existingTitles.length > 0) {
              const dedup = await llmSemaphore.run(() =>
                        withRetry(
                                    () =>
                                                  checkFuzzyDuplicate(
                                                                  listing.title,
                                                                  existingTitles,
                                                                  config.geminiApiKey,
                                                                  tracker,
                                                                  config.llmModel,
                                                                ),
                            { shouldRetry: isRetryableLLM },
                                  ),
                                                       );
              if (dedup.isDuplicate) {
                        log.info(
                            { url: job.url, title: listing.title, matched: dedup.matchedTitle },
                                    "duplicated",
                                  );
                        return "duplicated";
              }
      }

  await insertJob(notion, config.notionDatabaseId, listing, "To Review");
      syncer.addUrl(listing.url);
      syncer.addTitle(listing.company, listing.title);
      log.info({ url: job.url, title: listing.title, company: listing.company }, "inserted");
      return "inserted";
}
