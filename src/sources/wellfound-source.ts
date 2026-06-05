import { logger } from "../logger";
import type { RawJob } from "../types";

export interface WellfoundJob {
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
  tags?: string[];
}

export interface WellfoundResponse {
  jobs: WellfoundJob[];
  paging: {
    total: number;
    per_page: number;
    page: number;
    last_page: number;
  };
}

export async function searchWellfound(): Promise<RawJob[]> {
  try {
    logger.info("Searching Wellfound/AngelList for startup jobs", { source: "wellfound" });

    // Search for marketing roles on Wellfound
    const searchParams = new URLSearchParams({
      roles: "marketing",
      remote_ok: "true",
      page: "1",
      per_page: "100",
    });

    const response = await fetch(
      `https://www.wellfound.com/api/jobs?${searchParams.toString()}`,
      {
        headers: {
          "User-Agent": "JobFinder",
        },
      }
    );

    if (!response.ok) {
      logger.warn(`Wellfound API returned ${response.status}`, { source: "wellfound" });
      return [];
    }

    const data = (await response.json()) as WellfoundResponse;
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

    const smallCompanySizes = ["1-10", "11-50", "51-100"]; // Prefer 11-50

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
      salary: job.salary_min && job.salary_max
        ? `$${job.salary_min}-$${job.salary_max}`
        : job.salary_min
          ? `$${job.salary_min}+`
          : undefined,
      datePosted: new Date(job.created_at).toISOString(),
      postedBy: "wellfound",
      companySize: job.company_size,
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
