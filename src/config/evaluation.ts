// src/config/evaluation.ts
// Scoring and filtering for Digital Marketing Manager, SEO/GEO Manager,
// MarTech Manager, and AI Marketing Specialist roles.
//
// Candidate profile:
// - 12+ years digital marketing, B2B e-commerce, technical SEO, GEO
// - 6x Anthropic certified (Claude API, MCP x2, Claude Code, Agent Skills, Vertex AI)
// - 13 Google certs, 9 HubSpot certs, 6 SEMrush certs
// - Based in Buckeye/Phoenix AZ, open to remote
// - Target salary: $80k-$130k
// - Live portfolio at wav.com and 1mwc.com

import type { ExchangeRates } from "../services/exchangeRates";

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

// ── Hard gates (AND logic) — must ALL pass ────────────────────────────────────

export function getEvaluationFilters(_rates?: ExchangeRates): EvaluationFilter[] {
  return [
    {
      name: "location-requirement",
      prompt: `Evaluate if this job is available to someone based in Phoenix, Arizona or willing to work fully remote.

A job PASSES if:
- It is fully remote with no geographic restriction
- It is remote and open to US candidates
- It is based in Phoenix, Arizona or anywhere in Arizona
- It says "remote" or "work from anywhere" without excluding Arizona

A job FAILS if:
- It requires on-site work in a specific non-Arizona city
- It says "must be located in [specific non-AZ city]"
- It explicitly requires relocation to a non-Arizona location
- It is remote but explicitly excludes Arizona or the Mountain time zone

When in doubt, PASS the job. It is better to review a borderline job than to miss a real opportunity.`,
    },

    {
      name: "role-relevance",
      prompt: `Evaluate if this job matches one of these four target roles for a senior digital marketing professional.

A job PASSES if the title or description clearly matches ANY of these:

TARGET ROLE 1 — Digital Marketing Manager:
- "Digital Marketing Manager"
- "Senior Digital Marketing Manager"
- "Director of Digital Marketing"
- "Marketing Manager" with digital/online/e-commerce context
- "Growth Marketing Manager"
- "Performance Marketing Manager"
- "Demand Generation Manager"
- "Marketing Operations Manager"

TARGET ROLE 2 — SEO / GEO Manager:
- "SEO Manager" or "Senior SEO Manager"
- "Head of SEO"
- "GEO Specialist" or "Generative Engine Optimization"
- "Search Marketing Manager"
- "Organic Growth Manager"
- "Technical SEO Manager"
- "AI Search Specialist"

TARGET ROLE 3 — MarTech Manager / Marketing Operations:
- "MarTech Manager"
- "Marketing Technology Manager"
- "Marketing Operations Manager"
- "Marketing Automation Manager"
- "Revenue Operations" with marketing focus
- "CRM Manager" with marketing focus

TARGET ROLE 4 — AI Marketing Specialist / Head of AI Marketing:
- "AI Marketing" in any form
- "Marketing AI Specialist"
- "Head of AI" with marketing context
- "Generative AI Marketing"
- "LLM Marketing"
- "AI Content Manager" or "AI Content Strategist" at senior level

A job FAILS if:
- It is clearly entry-level or an internship
- It is sales, account executive, or business development (not marketing)
- It is creative/design only with no strategy component
- It requires hands-on software engineering or full-stack development
- The title is "Social Media Coordinator" or "Content Writer" only

When in doubt, PASS. A borderline role is worth reviewing.`,
    },
  ];
}

// ── Scoring profiles (OR logic) — ANY profile passing is enough ───────────────

export const EVALUATION_PROFILES: EvaluationProfile[] = [
  {
    name: "senior-digital-marketing-remote",
    prompt: `You are evaluating job listings for a senior digital marketing professional with this exact background:

CANDIDATE PROFILE:
- 12+ years of digital marketing experience in B2B e-commerce environments
- Managed a 280,000-page e-commerce ecosystem for a $200M B2B distributor
- Built AI content pipeline across 70,000+ SKUs using Claude API
- Shipped a live self-service Enterprise BOM Configurator (wav.com)
- Specialist in Generative Engine Optimization (GEO) and AI search visibility
- 6x Anthropic certified: Claude API, MCP, Claude Code, Agent Skills, Vertex AI
- 13 Google certifications including GA4, Search Ads 360, Campaign Manager 360
- 9 HubSpot certifications including Marketing Hub Software
- 6 SEMrush certifications including AI Visibility Essentials
- Expert in: technical SEO, GA4, Google Search Console, HubSpot Marketing Hub, NetSuite ERP, Shopify, WordPress
- Live AI portfolio at 1mwc.com
- Based in Phoenix/Buckeye AZ, strongly prefers remote
- Target salary: $80,000 to $130,000

SCORING INSTRUCTIONS — Score 0 to 100. A score of 55 or higher means the job is worth reviewing.

SCORE 85-100 (Excellent fit) if:
- Role is Digital Marketing Manager, SEO/GEO Manager, MarTech Manager, or AI Marketing Specialist
- Remote-first or fully remote
- Explicitly mentions: SEO, GEO, AI search, HubSpot, GA4, e-commerce, or B2B marketing
- Salary range overlaps with $80k-$130k OR salary is not stated (do not penalize for missing salary)
- Company is a MarTech platform, SEO tool, AI company, or digital agency

SCORE 70-84 (Good fit) if:
- Strong role match (Digital Marketing Manager or equivalent)
- Remote or Phoenix-based
- Mentions digital marketing, demand generation, or marketing technology
- Missing one or two ideal factors but otherwise strong

SCORE 55-69 (Worth reviewing) if:
- Role is a reasonable match but title is slightly different
- May be hybrid or have some location flexibility
- Company is in a relevant industry
- Some relevant skills mentioned even if not all

SCORE 40-54 (Weak fit, skip) if:
- Role is tangentially related but not a strong match
- On-site only in a non-Arizona city
- Salary significantly below $70k
- Junior or entry-level framing
- Large enterprise with rigid corporate structure and no mention of digital/AI focus

SCORE 0-39 (Reject) if:
- Sales, account management, or engineering role misclassified as marketing
- Requires hands-on coding or software development
- Clearly entry-level or internship
- On-site only in a specific non-Arizona location with no remote option

OWNERSHIP AND CULTURE RED FLAGS — apply a 10-15 point penalty if the description contains ANY of these:
- "recently acquired" / "newly acquired" / "under new ownership"
- "exciting transition" / "period of transformation" / "new chapter"
- "newly restructured" / "reorganizing" / "restructuring"
- "private equity" / "PE-backed" / "portfolio company"
- "post-merger" / "post-acquisition" / "integration phase"
- "offshore team" / "global delivery team" / "outsourced" in a marketing context
- "cost optimization" or "leaner team" framing in a marketing role
- Mentions of recent layoffs followed by a rehire push
These phrases indicate ownership-driven instability or cost-cutting environments
where marketing is undervalued. Apply the penalty and note it in your reasoning.

IMPORTANT RULES:
- Do NOT penalize for company size. A 500-person company can still be a great fit.
- Do NOT auto-reject any role based on company size alone.
- DO reward roles that mention AI, GEO, Claude, LLMs, or generative search.
- DO reward roles at MarTech companies, SEO platforms, or digital agencies.
- DO reward roles that mention HubSpot, GA4, SEO, or e-commerce.
- DO reward founder-led, bootstrapped, or early-stage companies with a higher score.
- If salary is not mentioned, assume it could be in range and do not penalize.
- When in doubt between two scores, pick the higher one. Missing a good job is worse than reviewing a borderline one.

Respond with ONLY a JSON object, no markdown, no code fences:
{
  "score": <0-100>,
  "reasoning": "<one clear sentence explaining the score and primary fit factors>",
  "pass": <true if score >= 55, false otherwise>
}`,
  },
];

export function getEvaluationProfiles(): EvaluationProfile[] {
  return EVALUATION_PROFILES;
}
