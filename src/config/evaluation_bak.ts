export interface EvaluationCriteria {
  pass: boolean;
  score: number;
  reasoning: string;
}

export interface EvaluationProfile {
  name: string;
  prompt: string;
}

export interface EvaluationFilter {
  name: string;
  prompt: string;
}

// Hard gates that MUST pass (AND logic)
const EVALUATION_FILTERS: EvaluationFilter[] = [
  {
    name: "location-requirement",
    prompt: `Evaluate if this job is available to someone based in Phoenix, Arizona or willing to work fully remote.
A job PASSES if:
- It is fully remote (no location restriction)
- It is based in Phoenix, Arizona
- It is anywhere in Arizona
- It explicitly welcomes remote from US

A job FAILS if:
- It requires on-site in a specific non-Arizona location
- It explicitly excludes Phoenix/Arizona/remote
- It requires relocation`,
  },

  {
    name: "role-relevance",
    prompt: `Evaluate if this is a Digital Marketing Manager or closely related role.
A job PASSES if the title contains ANY of:
- "Digital Marketing Manager"
- "Marketing Manager" (with digital/online context in description)
- "Demand Generation Manager"
- "Performance Marketing Manager"
- "Growth Marketing Manager"
- "Marketing Operations Manager"
- "Director of Digital Marketing"
- "Senior Marketing Manager" (with digital focus)

A job FAILS if:
- It's a junior, entry-level, or internship role
- It's sales, account management, or business development (not marketing)
- It's creative/design-only, social media specialist only, or content writer
- It requires hands-on coding or engineering`,
  },
];

// Scoring profiles (OR logic)
export const EVALUATION_PROFILES: EvaluationProfile[] = [
  {
    name: "digital-marketing-manager-fit",
    prompt: `You evaluate job listings for a Digital Marketing Manager role. The candidate has 12+ years of digital marketing experience, specializes in GEO (local search marketing) and AI integration, and is based in Phoenix, Arizona but open to remote.

Score this job 0-100 based on fit. A score of 60+ means it's worth reviewing.

HIGHER SCORES (80+) if:
- Explicitly mentions digital marketing, demand generation, or growth marketing
- Remote-first or Phoenix-based
- Salary range $75k-$120k+
- Values GEO, SEO/SEM, or AI/automation experience
- Mentions marketing tech stack or analytics
- Senior or manager level (not junior)

MEDIUM SCORES (60-79) if:
- Digital marketing focus but missing one key requirement
- Broader "marketing manager" role that could include digital
- Salary slightly below/above range but otherwise strong fit

LOWER SCORES (below 60) if:
- Primarily sales, account management, or partnership focused
- Requires specific industry experience (healthcare, finance) that's a poor fit
- Entry-level or internship
- On-site only in non-Arizona location
- No mention of marketing technology or analytics

Respond with ONLY a JSON object:
{
  "score": <0-100>,
  "reasoning": "<one sentence explaining the score>",
  "pass": <true if score >= 60, false otherwise>
}`,
  },
];

export function getEvaluationFilters(): EvaluationFilter[] {
  return EVALUATION_FILTERS;
}