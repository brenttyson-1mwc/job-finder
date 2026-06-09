// src/config/companies.ts
// Companies to monitor for marketing/growth roles.
// Add/remove companies here — no code changes needed elsewhere.
//
// How to find slugs:
//   Ashby:      jobs.ashbyhq.com/{slug}/...          → slug is the subdomain part
//   Lever:      jobs.lever.co/{slug}/...              → slug is the path segment
//   Greenhouse: boards.greenhouse.io/{slug}/jobs/...  → slug is the path segment
//   Workable:   apply.workable.com/{slug}/j/...       → slug is the path segment

export interface CompanyTarget {
  name: string;       // human-readable, used in logs
  ats: "ashby" | "lever" | "greenhouse" | "workable";
  slug: string;       // ATS-specific company identifier
}

export const COMPANY_TARGETS: CompanyTarget[] = [
  // --- Ashby ---
  { name: "Linear",        ats: "ashby",      slug: "linear"        },
  { name: "Vercel",        ats: "ashby",      slug: "vercel"        },
  { name: "Loom",          ats: "ashby",      slug: "loom"          },
  { name: "Retool",        ats: "ashby",      slug: "retool"        },
  { name: "Notion",        ats: "ashby",      slug: "notion"        },
  { name: "Figma",         ats: "ashby",      slug: "figma"         },
  { name: "Ramp",          ats: "ashby",      slug: "ramp"          },
  { name: "Rippling",      ats: "ashby",      slug: "rippling"      },
  { name: "Anthropic",     ats: "ashby",      slug: "anthropic"     },
  { name: "OpenAI",        ats: "ashby",      slug: "openai"        },
  { name: "Runway",        ats: "ashby",      slug: "runway"        },
  { name: "Perplexity",    ats: "ashby",      slug: "perplexity-ai" },
  { name: "Cursor",        ats: "ashby",      slug: "anysphere"     },
  { name: "Hex",           ats: "ashby",      slug: "hex"           },
  { name: "Webflow",       ats: "ashby",      slug: "webflow"       },

  // --- Lever ---
  { name: "Stripe",        ats: "lever",      slug: "stripe"        },
  { name: "Airtable",      ats: "lever",      slug: "airtable"      },
  { name: "Zapier",        ats: "lever",      slug: "zapier"        },
  { name: "Miro",          ats: "lever",      slug: "miro"          },

  // --- Greenhouse ---
  { name: "HubSpot",       ats: "greenhouse", slug: "hubspot"       },
  { name: "Asana",         ats: "greenhouse", slug: "asana"         },
  { name: "Canva",         ats: "greenhouse", slug: "canva"         },
  { name: "Intercom",      ats: "greenhouse", slug: "intercom"      },
  { name: "Klaviyo",       ats: "greenhouse", slug: "klaviyo"       },
  { name: "Monday.com",    ats: "greenhouse", slug: "mondaycom"     },
  { name: "Amplitude",     ats: "greenhouse", slug: "amplitude"     },
  { name: "Braze",         ats: "greenhouse", slug: "braze"         },

  // --- Workable ---
  { name: "Typeform",      ats: "workable",   slug: "typeform"      },
];
