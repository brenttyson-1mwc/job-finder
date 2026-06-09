// src/config/companies.ts
// Companies to monitor for marketing/growth roles.
// Add/remove companies here — no code changes needed elsewhere.
//
// To verify a slug works:
//   Ashby:      https://api.ashbyhq.com/posting-api/job-board/{slug}
//   Lever:      https://api.lever.co/v0/postings/{slug}?mode=json&limit=1
//   Greenhouse: https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?per_page=1

export interface CompanyTarget {
    name: string;
    ats: "ashby" | "lever" | "greenhouse" | "workable";
    slug: string;
}

export const COMPANY_TARGETS: CompanyTarget[] = [
    // --- Ashby (verified) ---
  { name: "Linear",     ats: "ashby", slug: "linear"     },
  { name: "Notion",     ats: "ashby", slug: "notion"     },
  { name: "Ramp",       ats: "ashby", slug: "ramp"       },
  { name: "Anthropic",  ats: "ashby", slug: "anthropic"  },
  { name: "OpenAI",     ats: "ashby", slug: "openai"     },
  { name: "Runway",     ats: "ashby", slug: "runway"     },
  { name: "Perplexity", ats: "ashby", slug: "perplexity" },
  { name: "Cursor",     ats: "ashby", slug: "cursor"     },
  { name: "Zapier",     ats: "ashby", slug: "zapier"     },
  { name: "ClickUp",    ats: "ashby", slug: "clickup"    },
  { name: "PostHog",    ats: "ashby", slug: "posthog"    },
  { name: "Vercel",     ats: "ashby", slug: "vercel"     },

    // --- Greenhouse (verified) ---
  { name: "Stripe",     ats: "greenhouse", slug: "stripe"     },
  { name: "Airtable",   ats: "greenhouse", slug: "airtable"   },
  { name: "Figma",      ats: "greenhouse", slug: "figma"      },
  { name: "Webflow",    ats: "greenhouse", slug: "webflow"    },
  { name: "Asana",      ats: "greenhouse", slug: "asana"      },
  { name: "Intercom",   ats: "greenhouse", slug: "intercom"   },
  { name: "Klaviyo",    ats: "greenhouse", slug: "klaviyo"    },
  { name: "Amplitude",  ats: "greenhouse", slug: "amplitude"  },
  { name: "Braze",      ats: "greenhouse", slug: "braze"      },
  { name: "Attentive",  ats: "greenhouse", slug: "attentive"  },
  ];
