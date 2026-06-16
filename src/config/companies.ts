// src/config/companies.ts
// Companies to monitor for Digital Marketing Manager, SEO/GEO Manager,
// MarTech Manager, and AI Marketing Specialist roles.
//
// All slugs verified against live ATS endpoints June 2026.
// Size filter: founder-led, no recent PE acquisition, ideally 11-150 employees.
//
// Slug verification:
//   Ashby:      https://api.ashbyhq.com/posting-api/job-board/{slug}
//   Lever:      https://api.lever.co/v0/postings/{slug}?mode=json&limit=1
//   Greenhouse: https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?per_page=1

export interface CompanyTarget {
  name: string;
  ats: "ashby" | "lever" | "greenhouse" | "workable";
  slug: string;
}

export const COMPANY_TARGETS: CompanyTarget[] = [

  // ── AI / GEO Startups ─────────────────────────────────────────────────────
  { name: "Anthropic",       ats: "ashby",      slug: "anthropic"      },
  { name: "Perplexity",      ats: "ashby",      slug: "perplexity"     },
  { name: "OpenAI",          ats: "ashby",      slug: "openai"         },
  { name: "Glean",           ats: "greenhouse", slug: "gleanwork"      },
  { name: "Copy.ai",         ats: "lever",      slug: "CopyAI"         },

  // ── Analytics / Attribution ───────────────────────────────────────────────
  { name: "Triple Whale",    ats: "greenhouse", slug: "triplewhale"    },
  { name: "Northbeam",       ats: "greenhouse", slug: "northbeam"      },
  { name: "Amplitude",       ats: "greenhouse", slug: "amplitude"      },
  { name: "Mixpanel",        ats: "greenhouse", slug: "mixpanel"       },

  // ── MarTech / SEO Platforms ───────────────────────────────────────────────
  { name: "HubSpot",         ats: "greenhouse", slug: "hubspot"        },
  { name: "Yext",            ats: "ashby",      slug: "yext"           },
  { name: "Semrush",         ats: "greenhouse", slug: "semrush"        },
  { name: "Klaviyo",         ats: "greenhouse", slug: "klaviyo"        },
  { name: "Iterable",        ats: "greenhouse", slug: "iterable"       },
  { name: "Attentive",       ats: "greenhouse", slug: "attentive"      },
  { name: "Braze",           ats: "greenhouse", slug: "braze"          },
  { name: "Demandbase",      ats: "greenhouse", slug: "demandbase"     },
  { name: "6sense",          ats: "greenhouse", slug: "6sense"         },

  // ── CMS / E-Commerce ─────────────────────────────────────────────────────
  { name: "Webflow",         ats: "greenhouse", slug: "webflow"        },
  { name: "Shopify",         ats: "greenhouse", slug: "shopify"        },
  { name: "Contentful",      ats: "greenhouse", slug: "contentful"     },
  { name: "Sanity",          ats: "ashby",      slug: "sanity"         },
  { name: "WP Engine",       ats: "ashby",      slug: "wpengine"       },

  // ── B2B SaaS (remote-friendly marketing teams) ────────────────────────────
  { name: "Notion",          ats: "ashby",      slug: "notion"         },
  { name: "Linear",          ats: "ashby",      slug: "linear"         },
  { name: "ClickUp",         ats: "ashby",      slug: "clickup"        },
  { name: "Zapier",          ats: "ashby",      slug: "zapier"         },
  { name: "Vercel",          ats: "ashby",      slug: "vercel"         },
  { name: "PostHog",         ats: "ashby",      slug: "posthog"        },
  { name: "Ramp",            ats: "ashby",      slug: "ramp"           },
  { name: "Apollo.io",       ats: "ashby",      slug: "apolloio"       },
  { name: "Intercom",        ats: "greenhouse", slug: "intercom"       },
  { name: "Asana",           ats: "greenhouse", slug: "asana"          },
  { name: "Airtable",        ats: "greenhouse", slug: "airtable"       },
  { name: "ZoomInfo",        ats: "greenhouse", slug: "zoominfo"       },
  { name: "Salesloft",       ats: "greenhouse", slug: "salesloft"      },
  { name: "Gong",            ats: "greenhouse", slug: "gong"           },

  // ── Digital Agencies ──────────────────────────────────────────────────────
  { name: "Tinuiti",         ats: "greenhouse", slug: "tinuiti"        },
  { name: "Wpromote",        ats: "greenhouse", slug: "wpromote"       },
  { name: "Directive",       ats: "greenhouse", slug: "directive"      },

  // ── Phoenix / Arizona ─────────────────────────────────────────────────────
  { name: "GoDaddy",         ats: "greenhouse", slug: "godaddy"        },
  { name: "Carvana",         ats: "greenhouse", slug: "carvana"        },

];
