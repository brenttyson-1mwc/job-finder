import type { JobFinderConfig } from "../config";
import { fetchWithRetry } from "../services/http";
import { logger } from "../logger";
import type { RawJob } from "../types";

interface JinaSearchResult {
  title: string;
  url: string;
  description: string;
}

interface JinaSearchResponse {
  code: number;
  data: JinaSearchResult[];
}

export function buildSearchQuery(keyword: string, domain: string): string {
  return `site:${domain} ${keyword}`;
}

export function filterJobUrls(results: JinaSearchResult[], domain: string): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const result of results) {
    const url = result.url.replace(/[.,;:!?]+$/, "");
    if (url.includes(domain) && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

export async function fetchJinaSearch(
  query: string,
  config: Pick<JobFinderConfig, "jinaApiKey">,
): Promise<JinaSearchResult[]> {
  const url = `https://s.jina.ai/?q=${encodeURIComponent(query)}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (config.jinaApiKey) {
    headers.Authorization = `Bearer ${config.jinaApiKey}`;
  }
  const res = await fetchWithRetry(url, { headers });
  const json = (await res.json()) as JinaSearchResponse;
  return json.data ?? [];
}

export async function fetchViaJina(
  targetUrl: string,
  config: Pick<JobFinderConfig, "jinaBaseUrl" | "jinaApiKey">,
): Promise<string> {
  const jinaUrl = `${config.jinaBaseUrl}/${targetUrl}`;
  const headers: Record<string, string> = {
    Accept: "text/markdown",
  };
  if (config.jinaApiKey) {
    headers.Authorization = `Bearer ${config.jinaApiKey}`;
  }
  const res = await fetchWithRetry(jinaUrl, { headers });
  return res.text();
}

export async function searchJobs(
  keyword: string,
  domain: string,
  config: JobFinderConfig,
): Promise<string[]> {
  const query = buildSearchQuery(keyword, domain);
  const results = await fetchJinaSearch(query, config);
  return filterJobUrls(results, domain);
}

// ============ RemoteOK API ============
export async function searchRemoteOK(): Promise<RawJob[]> {
  try {
    logger.info("Searching RemoteOK API for remote jobs", { source: "remoteok" });

    const response = await fetchWithRetry("https://remoteok.io/api");

    const jobs = (await response.json()) as Array<{
      id: string;
      slug: string;
      url: string;
      company: string;
      position: string;
      description: string;
      salary?: string | number;
      location?: string;
      date_posted: string;
    }>;

    // Filter for marketing-related roles
    const marketingKeywords = [
      "digital marketing",
      "marketing manager",
      "demand generation",
      "growth marketing",
      "performance marketing",
      "marketing director",
      "ai marketing",
    ];

    const filteredJobs = jobs.filter((job) => {
      const positionLower = job.position.toLowerCase();
      const descriptionLower = job.description?.toLowerCase() || "";

      return marketingKeywords.some(
        (keyword) =>
          positionLower.includes(keyword) || descriptionLower.includes(keyword)
      );
    });

    logger.info(`Found ${filteredJobs.length} marketing jobs on RemoteOK`, {
      source: "remoteok",
      total: jobs.length,
    });

    // Map to standard RawJob format
    const rawJobs: RawJob[] = filteredJobs.map((job) => ({
      url: job.url,
      source: "remoteok",
      title: job.position,
      company: job.company,
      location: job.location || "Remote",
      description: job.description,
      salary: job.salary ? String(job.salary) : undefined,
      datePosted: new Date(job.date_posted).toISOString(),
      postedBy: "remoteok",
    }));

    return rawJobs;
  } catch (error) {
    logger.error("RemoteOK API search failed", {
      source: "remoteok",
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

// ============ Wellfound/AngelList API ============
export async function searchWellfound(): Promise<RawJob[]> {
  try {
    logger.info("Searching Wellfound/AngelList for startup jobs", { source: "wellfound" });

    const searchParams = new URLSearchParams({
      roles: "marketing",
      remote_ok: "true",
      page: "1",
      per_page: "100",
    });

    const response = await fetchWithRetry(
      `https://www.wellfound.com/api/jobs?${searchParams.toString()}`,
      {
        headers: {
          "User-Agent": "JobFinder",
        },
      }
    );

    const data = (await response.json()) as {
      jobs: Array<{
        id: string;
        title: string;
        slug: string;
        pitch?: string;
        description?: string;
        url: string;
        company_id: string;
        company_name: string;
        company_size?: string;
        location?: string;
        salary_min?: number;
        salary_max?: number;
        created_at: string;
        updated_at: string;
      }>;
    };

    const jobs = data.jobs || [];

    // Filter for marketing roles and small companies
    const marketingKeywords = [
      "digital marketing",
      "marketing manager",
      "demand generation",
      "growth marketing",
      "performance marketing",
      "marketing director",
      "ai marketing",
    ];

    const smallCompanySizes = ["1-10", "11-50", "51-100"];

    const filteredJobs = jobs.filter((job) => {
      const titleLower = job.title.toLowerCase();
      const descriptionLower = job.description?.toLowerCase() || "";

      const isMarketing = marketingKeywords.some(
        (keyword) =>
          titleLower.includes(keyword) || descriptionLower.includes(keyword)
      );

      const isSmallCompany = !job.company_size || smallCompanySizes.includes(job.company_size);

      return isMarketing && isSmallCompany;
    });

    logger.info(`Found ${filteredJobs.length} marketing jobs on Wellfound`, {
      source: "wellfound",
      total: jobs.length,
    });

    // Map to standard RawJob format
    const rawJobs: RawJob[] = filteredJobs.map((job) => ({
      url: job.url,
      source: "wellfound",
      title: job.title,
      company: job.company_name,
      location: job.location || "Remote",
      description: job.description || job.pitch || "",
      salary:
        job.salary_min && job.salary_max
          ? `$${job.salary_min}-$${job.salary_max}`
          : job.salary_min
            ? `$${job.salary_min}+`
            : undefined,
      datePosted: new Date(job.created_at).toISOString(),
      postedBy: "wellfound",
    }));

    return rawJobs;
  } catch (error) {
    logger.error("Wellfound API search failed", {
      source: "wellfound",
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}