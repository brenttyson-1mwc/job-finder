import dotenv from 'dotenv';
dotenv.config();
import { config, COMPANY_TARGETS } from "./config";
import { getEvaluationFilters } from "./config/evaluation";
import { logger } from "./logger";
import { discoverAllJobs } from "./pipeline/discover";
import { type ProcessResult, processDiscoveredJob, type ScrapeStats } from "./pipeline/processUrl";
import { prune } from "./pipeline/prune";
import { reconcile } from "./pipeline/reconcile";
import { runPreflight } from "./preflight";
import { clearAshbyCache } from "./services/ats";
import { fetchExchangeRates } from "./services/exchangeRates";
import { createNotionClient } from "./services/notion";
import { buildNotionCache, NotionCacheUpdater } from "./services/notionCache";
import { sendFatalError, sendRunReport } from "./services/slack";
import { TokenTracker } from "./services/tokenTracker";

const log = logger.child({ component: "main" });
const reconcileOnly = process.argv.includes("--reconcile-only");

async function main() {
    const startTime = Date.now();
    const notion = createNotionClient(config.notionToken);
    await runPreflight(notion, config.notionDatabaseId);

  // Reset per-run ATS caches (Ashby returns whole-org listings; we cache them
  // for the run, but stale entries between runs would mask updates).
  clearAshbyCache();

  if (reconcileOnly) {
        const stats = await reconcile(notion, config.notionDatabaseId);
        log.info({ stats, durationMs: Date.now() - startTime }, "reconciliation complete");
        return;
  }

  const preReconcileStats = await reconcile(notion, config.notionDatabaseId, "Pre-scrape");

  // Prune aged-out jobs before the full-table cache scan so the database (and
  // every startup scan) stays bounded as scrape volume grows.
  const pruneStats = await prune(notion, config.notionDatabaseId);

  // Pre-cache Notion data to avoid per-URL queries
  log.info("building notion cache");
    const cache = await buildNotionCache(notion, config.notionDatabaseId);
    log.info(
      {
              urls: cache.existingUrls.size,
              blocked: cache.blockedCompanies.size,
              recentApps: cache.recentAppCompanies.size,
              companies: cache.jobsByCompany.size,
      },
          "notion cache built",
        );

  const rates = await fetchExchangeRates();
    const filters = getEvaluationFilters(rates);
    const syncer = new NotionCacheUpdater(cache);
    const tracker = new TokenTracker();

  // Phase 1: Direct ATS API discovery — no Jina search, zero token cost
  log.info({ companies: COMPANY_TARGETS.length }, "phase 1: ATS discovery");
    const discoveredJobs = await discoverAllJobs();
    log.info({ found: discoveredJobs.length }, "phase 1 complete");

  // Phase 2: Process each discovered job
  const seenUrls = new Set<string>();
    log.info({ urls: discoveredJobs.length }, "phase 2: processing jobs");

  const processResults = await Promise.allSettled(
        discoveredJobs.map((job) =>
                processDiscoveredJob(job, { notion, config, syncer, seenUrls, tracker, filters }),
                               ),
      );

  // Aggregate stats
  const stats: ScrapeStats = {
        inserted: 0,
        skipped: 0,
        companyApplied: 0,
        rejected: 0,
        archived: 0,
        duplicated: 0,
        errored: 0,
  };

  for (const result of processResults) {
        if (result.status === "fulfilled") {
                const key = result.value as ProcessResult;
                if (key === "companyApplied") stats.companyApplied++;
                else if (key in stats) stats[key as keyof typeof stats]++;
        } else {
                log.error({ err: result.reason }, "job processing failed");
                stats.errored++;
        }
  }

  const postReconcileStats = await reconcile(notion, config.notionDatabaseId, "Post-scrape");
    const tokenSummary = tracker.summary();

  log.info({ stats }, "scrape summary");
    log.info({ reconcile: preReconcileStats }, "pre-scrape reconcile summary");
    log.info({ reconcile: postReconcileStats }, "post-scrape reconcile summary");
    log.info({ prune: pruneStats }, "prune summary");
    log.info({ tokens: tokenSummary }, "token usage summary");

  if (config.slackWebhookUrl) {
        await sendRunReport(
                config.slackWebhookUrl,
                stats,
                postReconcileStats,
                pruneStats,
          { urlCount: discoveredJobs.length, searchErrors: 0 },
                Date.now() - startTime,
                tokenSummary,
              ).catch((err) => log.warn({ err }, "slack report failed"));
  }
}

main().catch(async (err) => {
    logger.error({ err }, "fatal error");
    const cfg = (await import("./config")).config;
    if (cfg.slackWebhookUrl) {
          await sendFatalError(cfg.slackWebhookUrl, err).catch(() => {});
    }
    process.exit(1);
});
