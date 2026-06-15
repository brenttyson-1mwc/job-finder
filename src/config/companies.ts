// src/config/companies.ts
// Companies to monitor for Digital Marketing Manager, SEO/GEO Manager,
// MarTech Manager, and AI Marketing Specialist roles.
//
// Size filter: 11-150 employees strongly preferred.
// Agencies and focused MarTech startups only — no large enterprises.
//
// Slug verification:
//   Ashby:      https://api.ashbyhq.com/posting-api/job-board/{slug}
//   Lever:      https://api.lever.co/v0/postings/{slug}?mode=json&limit=1
//   Greenhouse: https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?per_page=1
//   Workable:   POST https://apply.workable.com/api/v3/accounts/{slug}/jobs

export interface CompanyTarget {
  name: string;
  ats: "ashby" | "lever" | "greenhouse" | "workable";
  slug: string;
}

export const COMPANY_TARGETS: CompanyTarget[] = [

  // ── AI / GEO Startups (11-50 employees) ───────────────────────────────────
  // These are exactly the kind of companies that need a senior GEO/AI specialist.
  // Small teams, fast-moving, your Anthropic certs are a direct differentiator.

  { name: "Perplexity",       ats: "ashby",      slug: "perplexity"      },
  { name: "Copy.ai",          ats: "ashby",      slug: "copyai"          },
  { name: "Typeface",         ats: "ashby",      slug: "typeface"        },
  { name: "Mutiny",           ats: "ashby",      slug: "mutinyhq"        },
  { name: "Metadata.io",      ats: "ashby",      slug: "metadata"        },
  { name: "Triple Whale",     ats: "ashby",      slug: "triplewhale"     },
  { name: "Northbeam",        ats: "ashby",      slug: "northbeam"       },
  { name: "Clearbit",         ats: "ashby",      slug: "clearbit"        },
  { name: "Bombora",          ats: "ashby",      slug: "bombora"         },
  { name: "Supermetrics",     ats: "ashby",      slug: "supermetrics"    },
  { name: "Databox",          ats: "ashby",      slug: "databox"         },
  { name: "Glean",            ats: "ashby",      slug: "glean"           },
  { name: "Sanity",           ats: "ashby",      slug: "sanity"          },
  { name: "PostHog",          ats: "ashby",      slug: "posthog"         },
  { name: "Ramp",             ats: "ashby",      slug: "ramp"            },
  { name: "Runway",           ats: "ashby",      slug: "runway"          },
  { name: "Cursor",           ats: "ashby",      slug: "cursor"          },
  { name: "Apollo.io",        ats: "ashby",      slug: "apollo"          },
  { name: "Drip",             ats: "ashby",      slug: "drip"            },

  // ── Small/Mid MarTech (11-150 employees) ──────────────────────────────────
  // Focused platforms where marketing is core — not a support function.

  { name: "Triple Whale",     ats: "greenhouse", slug: "triplewhale"     },
  { name: "Heap",             ats: "greenhouse", slug: "heap"            },
  { name: "Terminus",         ats: "greenhouse", slug: "terminus"        },
  { name: "RollWorks",        ats: "greenhouse", slug: "rollworks"       },
  { name: "Moz",              ats: "greenhouse", slug: "moz"             },
  { name: "Botify",           ats: "greenhouse", slug: "botify"          },
  { name: "Lumar",            ats: "greenhouse", slug: "lumar"           },
  { name: "Jasper",           ats: "greenhouse", slug: "jasper"          },
  { name: "Writer",           ats: "greenhouse", slug: "writer"          },
  { name: "Cohere",           ats: "greenhouse", slug: "cohere"          },
  { name: "Contentful",       ats: "greenhouse", slug: "contentful"      },
  { name: "Webflow",          ats: "greenhouse", slug: "webflow"         },
  { name: "BigCommerce",      ats: "greenhouse", slug: "bigcommerce"     },
  { name: "Mixpanel",         ats: "greenhouse", slug: "mixpanel"        },
  { name: "Amplitude",        ats: "greenhouse", slug: "amplitude"       },
  { name: "Portent",          ats: "greenhouse", slug: "portent"         },
  { name: "NP Digital",       ats: "greenhouse", slug: "npdigital"       },

  // ── Small Digital Agencies (remote-first, 11-100 employees) ───────────────
  // Agencies at this size run lean. You'd be a senior individual contributor
  // or small team lead — not buried in layers of management.

  { name: "Directive",        ats: "lever",      slug: "directive"       },  // 51-200, B2B SEO agency
  { name: "Tinuiti",          ats: "lever",      slug: "tinuiti"         },  // performance marketing
  { name: "ActiveCampaign",   ats: "lever",      slug: "activecampaign"  },
  { name: "WP Engine",        ats: "lever",      slug: "wpengine"        },
  { name: "Single Grain",     ats: "workable",   slug: "singlegrain"     },  // ~50 employees, Eric Siu
  { name: "Victorious",       ats: "workable",   slug: "victorious"      },  // ~50 employees, SEO agency
  { name: "Logical Position", ats: "workable",   slug: "logical-position"},

  // ── Zapier / ClickUp tier (small-ish SaaS with real marketing teams) ──────
  // These grew fast but marketing team is still tight and senior-focused.

  { name: "Zapier",           ats: "ashby",      slug: "zapier"          },  // remote-only
  { name: "ClickUp",          ats: "ashby",      slug: "clickup"         },
  { name: "Notion",           ats: "ashby",      slug: "notion"          },
  { name: "Linear",           ats: "ashby",      slug: "linear"          },
  { name: "Vercel",           ats: "ashby",      slug: "vercel"          },

  // ── Phoenix / Arizona (any size — proximity matters here) ─────────────────
  { name: "GoDaddy",          ats: "greenhouse", slug: "godaddy"         },
  { name: "Carvana",          ats: "greenhouse", slug: "carvana"         },
  { name: "Offerpad",         ats: "greenhouse", slug: "offerpad"        },
  { name: "Opendoor",         ats: "greenhouse", slug: "opendoor"        },

];
