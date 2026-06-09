// src/pipeline/discover.ts
// Replaces Jina search. Fetches job listings directly from ATS APIs.
// Zero external API cost — all endpoints are free and public.

import { logger } from "../logger";
import { SEARCH_KEYWORDS } from "../config/search";
import { COMPANY_TARGETS, type CompanyTarget } from "../config/companies";

const log = logger.child({ component: "discover" });

export interface DiscoveredJob {
  url: string;
  keyword: string;    // the keyword that matched
  title: string;      // from ATS API directly — no Jina needed
  company: string;    // human-readable company name
  description: string; // from ATS API if available, else ""
  location: string;
  workplaceType: string | null;
}

// ─── Keyword matching ────────────────────────────────────────────────────────

const KEYWORDS_LOWER = SEARCH_KEYWORDS.map((k) => k.toLowerCase());

function matchKeyword(title: string): string | null {
  const t = title.toLowerCase();
  return KEYWORDS_LOWER.find((k) => t.includes(k)) ?? null;
}

// ─── Ashby ───────────────────────────────────────────────────────────────────

interface AshbyJobEntry {
  id: string;
  title: string;
  isRemote?: boolean;
  workplaceType?: string | null;
  location?: string | null;
  jobUrl?: string;      // Ashby includes the canonical apply URL
}

interface AshbyBoardResponse {
  jobs: AshbyJobEntry[];
}

async function discoverAshby(company: CompanyTarget): Promise<DiscoveredJob[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${company.slug}`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    log.warn({ err, company: company.name }, "ashby board fetch failed");
    return [];
  }
  if (!res.ok) {
    log.warn({ status: res.status, company: company.name }, "ashby board non-ok");
    return [];
  }
  const data = (await res.json()) as AshbyBoardResponse;
  const results: DiscoveredJob[] = [];
  for (const job of data.jobs ?? []) {
    const keyword = matchKeyword(job.title);
    if (!keyword) continue;
    const jobUrl = job.jobUrl ?? `https://jobs.ashbyhq.com/${company.slug}/${job.id}`;
    results.push({
      url: jobUrl,
      keyword,
      title: job.title,
      company: company.name,
      description: "",
      location: job.location ?? "",
      workplaceType: job.workplaceType ?? null,
    });
  }
  return results;
}

// ─── Lever ───────────────────────────────────────────────────────────────────

interface LeverPosting {
  id: string;
  text: string;     // job title
  hostedUrl: string;
  categories?: { location?: string; commitment?: string };
  workplaceType?: string;
  descriptionPlain?: string;
}

async function discoverLever(company: CompanyTarget): Promise<DiscoveredJob[]> {
  const url = `https://api.lever.co/v0/postings/${company.slug}?mode=json`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    log.warn({ err, company: company.name }, "lever board fetch failed");
    return [];
  }
  if (!res.ok) {
    log.warn({ status: res.status, company: company.name }, "lever board non-ok");
    return [];
  }
  const data = (await res.json()) as LeverPosting[];
  const results: DiscoveredJob[] = [];
  for (const job of data ?? []) {
    const keyword = matchKeyword(job.text);
    if (!keyword) continue;
    results.push({
      url: job.hostedUrl,
      keyword,
      title: job.text,
      company: company.name,
      description: job.descriptionPlain?.slice(0, 8000) ?? "",
      location: job.categories?.location ?? "",
      workplaceType: job.workplaceType ?? null,
    });
  }
  return results;
}

// ─── Greenhouse ──────────────────────────────────────────────────────────────

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location?: { name?: string };
  content?: string;   // HTML description — we skip this
}

interface GreenhouseBoardResponse {
  jobs: GreenhouseJob[];
}

async function discoverGreenhouse(company: CompanyTarget): Promise<DiscoveredJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    log.warn({ err, company: company.name }, "greenhouse board fetch failed");
    return [];
  }
  if (!res.ok) {
    log.warn({ status: res.status, company: company.name }, "greenhouse board non-ok");
    return [];
  }
  const data = (await res.json()) as GreenhouseBoardResponse;
  const results: DiscoveredJob[] = [];
  for (const job of data.jobs ?? []) {
    const keyword = matchKeyword(job.title);
    if (!keyword) continue;
    results.push({
      url: job.absolute_url,
      keyword,
      title: job.title,
      company: company.name,
      description: "",   // fetch separately only if needed
      location: job.location?.name ?? "",
      workplaceType: null,  // not in list endpoint; ATS enrichment fills this
    });
  }
  return results;
}

// ─── Workable ────────────────────────────────────────────────────────────────

interface WorkableJob {
  shortcode: string;
  title: string;
  workplace?: string;
  location?: { country?: string; city?: string };
}

interface WorkableListResponse {
  results: WorkableJob[];
  nextPage?: string;
}

async function discoverWorkable(company: CompanyTarget): Promise<DiscoveredJob[]> {
  // POST with empty query returns all open jobs
  const url = `https://apply.workable.com/api/v3/accounts/${company.slug}/jobs`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "", workplace: ["remote", "hybrid"] }),
    });
  } catch (err) {
    log.warn({ err, company: company.name }, "workable board fetch failed");
    return [];
  }
  if (!res.ok) {
    log.warn({ status: res.status, company: company.name }, "workable board non-ok");
    return [];
  }
  const data = (await res.json()) as WorkableListResponse;
  const results: DiscoveredJob[] = [];
  for (const job of data.results ?? []) {
    const keyword = matchKeyword(job.title);
    if (!keyword) continue;
    const loc = [job.location?.city, job.location?.country].filter(Boolean).join(", ");
    results.push({
      url: `https://apply.workable.com/${company.slug}/j/${job.shortcode}`,
      keyword,
      title: job.title,
      company: company.name,
      description: "",
      location: loc,
      workplaceType: job.workplace ?? null,
    });
  }
  return results;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function discoverAllJobs(): Promise<DiscoveredJob[]> {
  log.info({ companies: COMPANY_TARGETS.length }, "starting ATS discovery");

  const results = await Promise.allSettled(
    COMPANY_TARGETS.map((company) => {
      switch (company.ats) {
        case "ashby":      return discoverAshby(company);
        case "lever":      return discoverLever(company);
        case "greenhouse": return discoverGreenhouse(company);
        case "workable":   return discoverWorkable(company);
      }
    }),
  );

  const all: DiscoveredJob[] = [];
  let errors = 0;
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
    else errors++;
  }

  log.info({ found: all.length, errors }, "ATS discovery complete");
  return all;
}
