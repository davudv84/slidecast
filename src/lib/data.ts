import { newId } from "./id";
import type {
  BrandKit,
  Doc,
  DocStatus,
  Faq,
  FontPair,
  Invoice,
  Plan,
  Preset,
  Profile,
  Scheme,
  Slide,
  SlideType,
  Template,
  Workspace,
} from "./types";

/* ------------------------------------------------------------------ fonts */

/** CSS font stacks for the four font pairs offered in the Style inspector. */
export const FONTS: Record<FontPair, string> = {
  geist: 'var(--font-geist-sans), "Geist", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'var(--font-geist-mono), "Geist Mono", ui-monospace, Menlo, monospace',
  grotesk: '"Helvetica Neue", Helvetica, Arial, sans-serif',
};

export const FONT_PAIR_LABELS: Record<FontPair, string> = {
  geist: "Geist / Geist",
  serif: "Georgia / Geist",
  mono: "Geist Mono / Geist",
  grotesk: "Helvetica / Geist",
};

/* -------------------------------------------------------------- templates */

type RawTemplate = [
  name: string,
  style: Template["style"],
  bg: string,
  fg: string,
  font: FontPair,
  weight: number,
  justify: Template["justify"],
];

/**
 * 20 slide templates across four styles. `bg`/`fg` are slide artwork, not UI
 * chrome, so they live here rather than in the theme tokens — the same way a
 * creator's uploaded brand colours do.
 */
const RAW_TEMPLATES: RawTemplate[] = [
  ["Mono", "Minimal", "#FFFFFF", "#0A0A0A", "geist", 600, "flex-end"],
  ["Ink", "Minimal", "#0A0A0A", "#FAFAFA", "geist", 600, "flex-end"],
  ["Paper", "Minimal", "#F5F2EB", "#1C1917", "serif", 500, "center"],
  ["Slate", "Minimal", "#1E293B", "#F8FAFC", "geist", 500, "flex-end"],
  ["Fog", "Minimal", "#E7E5E4", "#292524", "grotesk", 500, "flex-start"],
  ["Signal", "Bold", "#4F46E5", "#FFFFFF", "grotesk", 700, "flex-end"],
  ["Tar", "Bold", "#111111", "#FDE047", "grotesk", 700, "center"],
  ["Cherry", "Bold", "#B91C1C", "#FFF1F2", "grotesk", 700, "flex-end"],
  ["Volt", "Bold", "#CCFF00", "#111111", "mono", 700, "flex-start"],
  ["Cobalt", "Bold", "#1D4ED8", "#DBEAFE", "geist", 700, "flex-end"],
  ["Journal", "Editorial", "#FFFDF7", "#1F1F1F", "serif", 500, "flex-start"],
  ["Broadsheet", "Editorial", "#111111", "#E7E5E4", "serif", 500, "flex-start"],
  ["Manuscript", "Editorial", "#F0EDE6", "#3F3A34", "serif", 400, "center"],
  ["Column", "Editorial", "#FFFFFF", "#374151", "serif", 500, "flex-end"],
  ["Margin", "Editorial", "#2B2B2B", "#F5F5F4", "serif", 400, "flex-start"],
  ["Bubble", "Playful", "#FDE68A", "#78350F", "geist", 700, "center"],
  ["Mint", "Playful", "#A7F3D0", "#064E3B", "geist", 700, "flex-end"],
  ["Peach", "Playful", "#FED7AA", "#7C2D12", "grotesk", 700, "center"],
  ["Sky", "Playful", "#BAE6FD", "#0C4A6E", "geist", 700, "flex-start"],
  ["Lilac", "Playful", "#E9D5FF", "#4C1D95", "grotesk", 700, "flex-end"],
];

export const TEMPLATES: Template[] = RAW_TEMPLATES.map((t, id) => ({
  id,
  name: t[0],
  style: t[1],
  bg: t[2],
  fg: t[3],
  font: t[4],
  weight: t[5],
  justify: t[6],
}));

export const TEMPLATE_FILTERS = ["All", "Minimal", "Bold", "Editorial", "Playful"] as const;

export const SCHEMES: Scheme[] = [
  { name: "Ink on white", bg: "#FFFFFF", fg: "#0A0A0A" },
  { name: "White on ink", bg: "#0A0A0A", fg: "#FAFAFA" },
  { name: "Brand", bg: "#4F46E5", fg: "#FFFFFF" },
  { name: "Paper", bg: "#F5F2EB", fg: "#1C1917" },
  { name: "Volt", bg: "#CCFF00", fg: "#111111" },
];

export const TONES = ["Direct", "Story", "Educational", "Contrarian"] as const;
export type Tone = (typeof TONES)[number];

/* ------------------------------------------------------------- account */

export const DEFAULT_PROFILE: Profile = {
  name: "Marisol Reyes",
  email: "marisol@reyes.studio",
};

export const DEFAULT_BRAND: BrandKit = {
  name: "Reyes Studio",
  handle: "@marisol.writes",
  colors: ["#4F46E5", "#0A0A0A", "#F5F2EB", "#CCFF00"],
  logo: null,
  logoName: null,
};

export const DEFAULT_ACCENT = "#4F46E5";

/** Accent choices offered in Settings — the design's four brand options. */
export const ACCENT_OPTIONS = ["#4F46E5", "#0A0A0A", "#0F766E", "#C2410C"];

export const PLAN_USAGE = {
  plan: "Pro",
  used: 43,
  quota: 100,
  renews: "1 Oct 2026",
};

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: "preset_reyes",
    name: "Reyes Studio",
    fontLabel: "Geist",
    a: "#0A0A0A",
    b: "#F5F2EB",
    templateId: 1,
    font: "geist",
    scheme: null,
  },
  {
    id: "preset_founder",
    name: "Founder voice",
    fontLabel: "Georgia",
    a: "#FFFDF7",
    b: "#1F1F1F",
    templateId: 10,
    font: "serif",
    scheme: null,
  },
  {
    id: "preset_launch",
    name: "Launch week",
    fontLabel: "Helvetica",
    a: "#CCFF00",
    b: "#111111",
    templateId: 8,
    font: "grotesk",
    scheme: null,
  },
];

/* ------------------------------------------------------------ seed docs */

type RawSlide = [SlideType, string, string];

export const SEED_SLIDES: RawSlide[] = [
  ["hook", "Post one carousel a day. Not three a week.", "The math nobody tells you about consistency."],
  ["point", "Day 1–30: nobody is watching.", "Use it. This is the only time you can be bad in public for free."],
  ["point", "Day 31–60: the algorithm starts testing you.", "One in ten posts gets pushed. You won’t know which. Post anyway."],
  ["quote", "“Consistency is a distribution strategy, not a personality trait.”", "— Marisol Reyes"],
  ["list", "The 3 slides every carousel needs", "A hook that names a pain. A turn that reframes it. A CTA that asks for one thing."],
  ["point", "Day 61–90: saves beat likes.", "Write for the person who screenshots. That’s who the algorithm trusts."],
  ["point", "800 → 41k in 90 days.", "Not viral. Just 90 posts in a row."],
  ["cta", "Save this. Then post today.", "Follow @marisol.writes for one carousel system a week."],
];

interface RawDoc {
  title: string;
  templateId: number;
  status: DocStatus;
  minutesAgo: number;
  slides: RawSlide[];
}

const RAW_DOCS: RawDoc[] = [
  { title: "90-day carousel system", templateId: 0, status: "Draft", minutesAgo: 2, slides: SEED_SLIDES },
  {
    title: "Why I stopped using Canva",
    templateId: 1,
    status: "Scheduled",
    minutesAgo: 60,
    slides: [
      ["hook", "I made 600 carousels in Canva. Then I quit.", "Not because it’s bad. Because it’s for everything."],
      ["point", "Every carousel started with 40 minutes of layout.", "Resizing text boxes is not writing."],
      ["point", "Brand colours lived in my head, not the tool.", "Six clients, six hex codes, zero memory."],
      ["point", "Reordering slides meant rebuilding slides.", "Drag a page in Canva and watch your numbering die."],
      ["quote", "“A tool that does everything makes you do everything.”", "— note to self, March"],
      ["cta", "Same slides. Ten minutes.", "Follow @marisol.writes for the batching setup."],
    ],
  },
  {
    title: "Client onboarding checklist",
    templateId: 5,
    status: "Published",
    minutesAgo: 180,
    slides: [
      ["hook", "Onboarding a ghostwriting client in 48 hours.", "The checklist I send before the first invoice."],
      ["point", "1. Voice interview, 45 minutes, recorded.", "I ask about the last thing that made them angry online."],
      ["point", "2. Ten posts they wish they’d written.", "Not competitors. People they’d actually have a drink with."],
      ["point", "3. Three words they never want to sound like.", "‘Synergy’ comes up more than you’d think."],
      ["point", "4. Approval window: 24 hours, then it ships.", "Silence is a yes. It’s in the contract."],
      ["point", "5. A shared brand kit in Slidecast.", "Logo, handle, colours. Set once, used on every slide."],
      ["list", "6. First week: 3 drafts, 1 published.", "Calibrate on real reactions, not on a doc."],
      ["point", "7. Monthly voice review.", "People change. Their feed should too."],
      ["quote", "“The first month is a listening job.”", "— Reyes Studio playbook"],
      ["cta", "Save this before your next kickoff call.", "Follow @marisol.writes for the templates."],
    ],
  },
  {
    title: "Ghostwriting rates 2026",
    templateId: 10,
    status: "Draft",
    minutesAgo: 60 * 24,
    slides: [
      ["hook", "What I charge to ghostwrite in 2026.", "Real numbers, because nobody shares them."],
      ["point", "Single carousel: €180.", "Research, eight slides, two revisions."],
      ["point", "Weekly retainer: €1,400 a month.", "Four carousels, one voice review, Slack access."],
      ["point", "Founder package: €3,200 a month.", "Daily posts, comments strategy, monthly analytics."],
      ["point", "Rush fee: +40%.", "‘Can we post this tonight?’ is a pricing question."],
      ["quote", "“Charge for the judgment, not the typing.”", "— every senior writer I’ve met"],
      ["cta", "Screenshot this for your next proposal.", "Follow @marisol.writes for the rate calculator."],
    ],
  },
  {
    title: "5 hooks that stopped the scroll",
    templateId: 6,
    status: "Published",
    minutesAgo: 60 * 26,
    slides: [
      ["hook", "5 hooks that beat my average by 3×.", "Pulled from 90 days of data."],
      ["point", "“I was wrong about ___.”", "Admitting it buys attention nobody else will give you."],
      ["point", "“The math nobody tells you about ___.”", "Numbers promise specificity. Deliver it."],
      ["point", "“I made 600 ___. Then I quit.”", "Volume plus a turn. Works every time."],
      ["cta", "Steal one. Post today.", "Follow @marisol.writes for a hook a week."],
    ],
  },
  {
    title: "Founder voice vs brand voice",
    templateId: 3,
    status: "Scheduled",
    minutesAgo: 60 * 48,
    slides: [
      ["hook", "Your founder sounds like your brand. That’s the problem.", "One should be sharp. The other should be safe."],
      ["point", "Brand voice is a floor.", "It stops the intern from posting something weird."],
      ["point", "Founder voice is a ceiling.", "It’s where the opinions live. And the reach."],
      ["point", "Founders who sound like press releases get press-release engagement.", "Zero comments, two likes from the team."],
      ["point", "The fix: two style guides, one calendar.", "Brand posts Tuesday. Founder posts Thursday."],
      ["list", "Founder posts get: an opinion, a number, a name.", "Brand posts get: a feature, a customer, a date."],
      ["quote", "“People follow people. They tolerate brands.”", "— a client, correctly"],
      ["point", "Test: would this post survive a screenshot?", "If it needs the logo to make sense, it’s brand."],
      ["cta", "Save this for your next content review.", "Follow @marisol.writes for the founder framework."],
    ],
  },
  {
    title: "The €29 tool stack",
    templateId: 8,
    status: "Published",
    minutesAgo: 60 * 72,
    slides: [
      ["hook", "My entire content stack costs €29 a month.", "Six clients. Daily posts. No agency."],
      ["point", "Notes app: free.", "Every idea goes in raw. Editing happens later."],
      ["point", "Slidecast: €29.", "Paste the note, pick a tone, export eight PNGs."],
      ["point", "Scheduling: Buffer, free tier.", "Three channels is enough when you post daily."],
      ["point", "Analytics: a spreadsheet.", "Saves and follows. Nothing else moves the needle."],
      ["point", "Design: none.", "Templates plus a brand kit beat a designer on a deadline."],
      ["point", "Total: €29. Output: 30 carousels a month.", "That’s under €1 a post."],
      ["cta", "Save this. Cancel something tomorrow.", "Follow @marisol.writes for the batching routine."],
    ],
  },
  {
    title: "Reyes Studio Q3 recap",
    templateId: 2,
    status: "Published",
    minutesAgo: 60 * 96,
    slides: [
      ["hook", "Q3 at Reyes Studio, in six slides.", "Numbers, mistakes, and what changes in Q4."],
      ["point", "312 carousels shipped.", "Across six founders and two agencies."],
      ["point", "Best post: 41k saves.", "A checklist. Not a story. Noted."],
      ["point", "Biggest mistake: taking a seventh client.", "Quality dipped for three weeks. I fired myself from it."],
      ["point", "Q4: fewer clients, higher retainers.", "Five founders, €1,800 each. That’s the plan."],
      ["cta", "Thanks for reading along.", "Follow @marisol.writes for the Q4 build in public."],
    ],
  },
  {
    title: "How to price a carousel",
    templateId: 15,
    status: "Draft",
    minutesAgo: 60 * 24 * 7,
    slides: [
      ["hook", "Stop pricing carousels per slide.", "You’re not selling slides. You’re selling attention."],
      ["point", "Per-slide pricing punishes good editing.", "Cutting from ten to six slides shouldn’t cut your fee."],
      ["point", "Price the outcome: one post that gets saved.", "Research + hook + structure + export. One number."],
      ["point", "Anchor high, then offer a retainer.", "€180 once. €1,400 for four a month. Watch which they pick."],
      ["point", "Revisions: two included, then €40 each.", "Endless feedback loops are a pricing error, not a client error."],
      ["quote", "“A price is a boundary with a number on it.”", "— my accountant, roughly"],
      ["cta", "Save this before you send the next quote.", "Follow @marisol.writes for the pricing sheet."],
    ],
  },
  {
    title: "Notion vs. paper",
    templateId: 12,
    status: "Published",
    minutesAgo: 60 * 24 * 9,
    slides: [
      ["hook", "I plan 30 carousels a month on paper.", "Notion is where ideas go to look organised."],
      ["point", "Paper has no notifications.", "Thirty minutes of planning without a ping."],
      ["point", "Paper forces one idea per line.", "If it doesn’t fit, it isn’t a slide."],
      ["point", "Notion is for the archive, not the draft.", "Finished carousels go in. Nothing starts there."],
      ["cta", "Try one week on paper.", "Follow @marisol.writes for the weekly planning sheet."],
    ],
  },
  {
    title: "3 clients I fired (and why)",
    templateId: 11,
    status: "Published",
    minutesAgo: 60 * 24 * 14,
    slides: [
      ["hook", "I fired three clients this year. Revenue went up.", "The pattern was obvious in hindsight."],
      ["point", "Client 1: approved nothing, complained about reach.", "You can’t grow an account that never posts."],
      ["point", "Client 2: wanted every post to sell.", "Eight slides of pitch is a brochure, not a carousel."],
      ["point", "Client 3: paid late, every month.", "Chasing invoices is unpaid work. I stopped doing it."],
      ["point", "What replaced them: two founders who post daily.", "Same revenue, half the meetings."],
      ["quote", "“The clients you keep decide the work you get.”", "— a mentor, 2019"],
      ["list", "Red flags: no approval window, no opinions, no invoice on time.", "Any two of three, and it’s a no."],
      ["cta", "Save this for your next contract review.", "Follow @marisol.writes for the client scorecard."],
    ],
  },
  {
    title: "Batching day: the setup",
    templateId: 18,
    status: "Published",
    minutesAgo: 60 * 24 * 21,
    slides: [
      ["hook", "Tuesday is batching day. Here’s the whole setup.", "Seven carousels before lunch."],
      ["point", "8:00 — pick seven notes from the week.", "The ones that made me a little angry win."],
      ["point", "8:30 — paste, pick a tone, generate.", "Eight slides each. I edit the hooks first."],
      ["point", "9:30 — apply the brand kit.", "One click. Logo, handle, colours on all seven."],
      ["point", "10:00 — read every slide out loud.", "If I stumble, the reader scrolls."],
      ["point", "10:45 — export, schedule via Buffer.", "PNG at 1080×1350, Tuesday through Monday."],
      ["point", "11:00 — done. Rest of the week is comments.", "Replies grow accounts. Posts just start the conversation."],
      ["quote", "“Batching isn’t discipline. It’s a calendar.”", "— what I tell new clients"],
      ["cta", "Save this. Block next Tuesday.", "Follow @marisol.writes for the batching checklist."],
    ],
  },
];

function slidesFrom(raw: RawSlide[]): Slide[] {
  return raw.map(([type, headline, body]) => ({
    id: newId("s"),
    type,
    headline,
    body,
  }));
}

export function createSeedDocs(now = Date.now()): Doc[] {
  return RAW_DOCS.map((d, i) => {
    const updatedAt = now - d.minutesAgo * 60_000;
    return {
      id: `doc_seed_${i}`,
      title: d.title,
      slides: slidesFrom(d.slides),
      templateId: d.templateId,
      scheme: null,
      fontPair: TEMPLATES[d.templateId].font,
      align: "left",
      status: d.status,
      createdAt: updatedAt - 3 * 60 * 60_000,
      updatedAt,
    };
  });
}

export function createSeedWorkspace(now = Date.now()): Workspace {
  const docs = createSeedDocs(now);
  return {
    version: 1,
    docs,
    brand: DEFAULT_BRAND,
    profile: DEFAULT_PROFILE,
    presets: DEFAULT_PRESETS,
    accent: DEFAULT_ACCENT,
    lastOpenedId: docs[0]?.id ?? null,
  };
}

export function createBlankDoc(now = Date.now()): Doc {
  return {
    id: newId("doc"),
    title: "Untitled carousel",
    slides: [
      {
        id: newId("s"),
        type: "hook",
        headline: "Your hook goes here.",
        body: "One sentence that names the pain.",
      },
    ],
    templateId: 0,
    scheme: null,
    fontPair: "geist",
    align: "left",
    status: "Draft",
    createdAt: now,
    updatedAt: now,
  };
}

/* ------------------------------------------------------------- marketing */

export const INVOICES: Invoice[] = [
  ["INV-2026-0091", "1 Sep 2026", "€29.00", "Paid"],
  ["INV-2026-0078", "1 Aug 2026", "€29.00", "Paid"],
  ["INV-2026-0064", "1 Jul 2026", "€29.00", "Paid"],
  ["INV-2026-0051", "1 Jun 2026", "€29.00", "Paid"],
  ["INV-2026-0037", "1 May 2026", "€29.00", "Paid"],
  ["INV-2026-0022", "1 Apr 2026", "€0.00", "Trial"],
].map((i) => ({
  id: i[0],
  date: i[1],
  amount: i[2],
  status: i[3] as Invoice["status"],
}));

/** Headlines the landing-page mock generator and demo use. */
export const GEN_HEADS = [
  "Most creators post 3× a week and wonder why nothing sticks.",
  "Volume is the strategy. Quality is the by-product.",
  "Day 1–30: nobody is watching. Good.",
  "Day 31–60: the algorithm starts testing you.",
  "Write for the person who screenshots.",
  "Saves are the only metric that compounds.",
  "800 → 41k. Ninety posts. Zero viral.",
  "The system fits on one slide.",
  "You already have 90 ideas. You have 90 drafts.",
  "Post today. Save this for tomorrow.",
];

export const FAQS: Faq[] = [
  [
    "Does Slidecast write the slides for me?",
    "Yes. Paste anything from a tweet to 2,000 words and pick a tone. You get 5–10 slides you can edit word by word. Nothing posts without you.",
  ],
  [
    "What sizes can I export?",
    "PNG or PDF at 1080×1350 (Instagram post) or 1080×1920 (Story). PDFs work as LinkedIn document posts. Every export is numbered and zipped.",
  ],
  [
    "Can I use my own fonts and colors?",
    "Pro and Agency plans include a brand kit: logo, handle, up to 6 colors, and saved presets that apply across every template.",
  ],
  [
    "How is this different from Canva?",
    "Canva is a general design tool. Slidecast only does carousels — so generation, brand kits, reorder, and export are one screen, not a workflow.",
  ],
  [
    "Is there a free plan?",
    "Yes. 5 carousels a month, PNG export, all templates. No card required.",
  ],
].map((f) => ({ q: f[0], a: f[1] }));

export const PLANS: Plan[] = [
  {
    name: "Free",
    price: "€0",
    per: "/ month",
    desc: "For trying it on your own account.",
    features: [
      "5 carousels a month",
      "All 20 templates",
      "PNG export at 1080×1350",
      "Slidecast watermark on slide 8",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "€29",
    per: "/ month",
    desc: "For creators posting daily.",
    features: [
      "100 carousels a month",
      "Brand kit: logo, handle, 6 colors",
      "PNG + PDF, Post + Story sizes",
      "Schedule via Buffer",
      "No watermark",
    ],
    cta: "Start 14-day trial",
    popular: true,
  },
  {
    name: "Agency",
    price: "€79",
    per: "/ month",
    desc: "For teams managing client accounts.",
    features: [
      "Unlimited carousels",
      "10 brand kits, 5 seats",
      "Client approval links",
      "Priority generation queue",
      "Invoices per client",
    ],
    cta: "Talk to us",
  },
];

/** Five slides that page through the hero preview on the landing page. */
export const HERO_SLIDES = [0, 1, 5, 10, 15].map((templateId, i) => {
  const [type, headline, body] = SEED_SLIDES[[0, 1, 3, 4, 7][i]];
  return { template: TEMPLATES[templateId], type, headline, body };
});

export const TEMPLATE_HOVER_FRAMES = [
  "Post one carousel a day.",
  "Day 31–60: the algorithm tests you.",
  "Save this. Then post today.",
];
