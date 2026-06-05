import { logger } from "../logger";
import type { RawJob } from "../types";

export interface RemoteOKJob {
  id: string;
  slug: string;
  url: string;
  logo?: string;
  company: string;
  position: string;
  description: string;
  salary?: string | number;
  location?: string;
  tag?: string;
  date_posted: string;
}

export async function searchRemoteOK(): Promise<RawJob[]> {
  try {
    logger.info("Searching RemoteOK API for remote jobs", { source: "remoteok" });

    const response = await fetch("https://remoteok.io/api");
    
    if (!response.ok) {
      throw new Error(`RemoteOK API error: ${response.status}`);
    }

    const jobs: RemoteOKJob[] = await response.json();

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
