import { icons, type IconNode } from "lucide";
import { stripRich } from "./rich-text";
import type { Detail, Slide, SlideType } from "./types";

/**
 * Details are the small visual under a slide's text. Two of the three kinds
 * are produced locally from the copy itself:
 *  - "icon"  — the best-fitting glyph from the 1,700-icon Lucide library,
 *              matched on the words in the headline, body and list items;
 *  - "stat"  — a figure lifted from the text (a %, a currency amount, a
 *              multiplier) drawn as a big number with a two-bar comparison.
 * The third, "image", is whatever the creator uploads.
 */

/* ---------------------------------------------------------------- keywords */

const KEYWORDS: [string[], string][] = [
  [["photo", "photos", "picture", "pictures", "camera", "gallery", "image", "images", "bilder", "foto", "fotos"], "Camera"],
  [["video", "videos", "clip", "clips", "reel", "reels", "film"], "Clapperboard"],
  [["storage", "space", "gb", "tb", "speicher", "disk", "drive", "bucket"], "HardDrive"],
  [["cloud", "backup", "sync"], "Cloud"],
  [["mail", "email", "inbox", "attachment", "attachments", "gmail", "newsletter"], "Mail"],
  [["phone", "handy", "smartphone", "iphone", "android", "mobile"], "Smartphone"],
  [["bin", "trash", "delete", "deleted", "deleting", "papierkorb", "remove"], "Trash2"],
  [["upload", "uploads"], "Upload"],
  [["download", "downloads", "export"], "Download"],
  [["frozen", "freeze", "stuck", "still", "stop", "stillstand"], "Snowflake"],
  [["time", "hour", "hours", "minute", "minutes", "clock", "late", "deadline", "zeit"], "Clock"],
  [["day", "days", "week", "weeks", "month", "monthly", "calendar", "schedule", "tuesday", "batch", "batching", "daily"], "CalendarDays"],
  [["money", "price", "pricing", "rate", "rates", "cost", "costs", "€", "eur", "euro", "fee", "invoice", "invoices", "charge", "pay", "paid", "revenue", "retainer", "budget"], "Coins"],
  [["growth", "grow", "grew", "followers", "reach", "compound", "compounds", "trend", "up", "scale"], "TrendingUp"],
  [["data", "analytics", "metric", "metrics", "study", "studie", "statistics", "numbers", "chart", "report", "percent"], "BarChart3"],
  [["idea", "ideas", "insight", "hook", "hooks", "creative", "inspiration"], "Lightbulb"],
  [["brain", "think", "thinking", "mindset", "psychology", "focus", "learn", "learning"], "Brain"],
  [["launch", "ship", "shipped", "start", "starting", "rocket", "fast", "speed"], "Rocket"],
  [["goal", "goals", "target", "aim", "plan", "planning", "strategy"], "Target"],
  [["client", "clients", "customer", "customers", "audience", "people", "team", "community", "friends", "freunde", "umfeld"], "Users"],
  [["founder", "founders", "ceo", "boss", "leader", "leadership", "business", "unternehmen"], "Briefcase"],
  [["contract", "contracts", "approval", "approve", "sign", "agreement", "terms"], "FileSignature"],
  [["save", "saves", "saved", "bookmark", "screenshot", "screenshots"], "Bookmark"],
  [["follow", "following", "subscribe"], "UserPlus"],
  [["comment", "comments", "reply", "replies", "conversation", "dm", "message", "messages"], "MessageCircle"],
  [["write", "writing", "writer", "ghostwrite", "ghostwriting", "draft", "drafts", "copy", "caption", "post", "posts", "posting"], "PenLine"],
  [["note", "notes", "notebook", "paper", "journal", "notion", "list", "checklist"], "NotebookPen"],
  [["design", "designer", "canva", "template", "templates", "layout", "brand", "colours", "colors", "logo"], "Palette"],
  [["tool", "tools", "stack", "setup", "app", "apps", "software", "saas"], "Layers"],
  [["voice", "podcast", "interview", "audio", "record", "recorded", "talk", "speak"], "Mic"],
  [["ai", "ki", "generate", "generated", "generative", "chatgpt", "model", "automation", "automate"], "Sparkles"],
  [["fire", "burn", "hot", "viral", "trending"], "Flame"],
  [["warning", "mistake", "mistakes", "wrong", "error", "risk", "danger", "problem", "problems"], "AlertTriangle"],
  [["question", "questions", "why", "how", "what", "ask"], "HelpCircle"],
  [["check", "done", "complete", "approved", "correct", "right", "richtig", "consistent", "consistency"], "CheckCircle2"],
  [["star", "favourite", "favorite", "best", "top", "quality"], "Star"],
  [["love", "heart", "like", "likes", "passion"], "Heart"],
  [["eye", "watch", "watching", "see", "seen", "view", "views", "visible", "attention"], "Eye"],
  [["search", "find", "research", "discover", "explore"], "Search"],
  [["key", "secret", "unlock", "access", "password"], "KeyRound"],
  [["lock", "private", "security", "secure", "safe"], "Lock"],
  [["shield", "protect", "trust", "trusted", "boundary", "boundaries"], "ShieldCheck"],
  [["world", "global", "international", "web", "internet", "online"], "Globe"],
  [["home", "house", "office", "studio", "workspace"], "Home"],
  [["coffee", "morning", "routine", "habit", "habits"], "Coffee"],
  [["book", "books", "read", "reading", "playbook", "guide", "story", "stories"], "BookOpen"],
  [["code", "developer", "dev", "programming", "engineer", "build", "building"], "Code2"],
  [["laptop", "desktop", "computer", "screen", "work", "working"], "Laptop"],
  [["hand", "handshake", "deal", "partner", "partners", "agency", "hire", "hired", "fired"], "Handshake"],
  [["megaphone", "announce", "marketing", "promote", "promotion", "ads", "advertising"], "Megaphone"],
  [["bell", "notification", "notifications", "alert", "reminder", "ping"], "Bell"],
  [["gift", "free", "bonus", "reward"], "Gift"],
  [["trophy", "win", "winning", "won", "success", "successful", "achievement", "result", "results"], "Trophy"],
  [["flag", "milestone", "finish", "goal-line", "done"], "Flag"],
  [["compass", "direction", "path", "journey", "route", "spur", "track"], "Compass"],
  [["energy", "power", "quick", "instant", "boost", "productivity", "productive", "produktiv", "produktivität"], "Zap"],
  [["sun", "light", "bright", "clear"], "Sun"],
  [["night", "sleep", "rest", "dark"], "Moon"],
  [["plant", "leaf", "organic", "natural", "slow", "patience"], "Leaf"],
  [["mountain", "climb", "hard", "difficult", "challenge", "durchziehen"], "Mountain"],
  [["plane", "travel", "trip", "flight", "holiday", "vacation"], "Plane"],
  [["car", "drive", "driving", "road"], "Car"],
  [["run", "running", "steps", "walk", "move", "movement", "sport", "gym", "training"], "Footprints"],
  [["percent", "%", "prozent", "share", "ratio"], "Percent"],
  [["quote", "quotes", "said", "says", "sagt"], "Quote"],
  [["link", "links", "share", "sharing", "url"], "Link2"],
  [["layout", "slide", "slides", "carousel", "carousels", "swipe"], "GalleryHorizontalEnd"],
  [["scroll", "feed", "algorithm", "instagram", "linkedin", "tiktok", "social"], "Smartphone"],
  [["spreadsheet", "sheet", "table", "excel"], "Table2"],
  [["calculator", "math", "calculate", "count", "counting"], "Calculator"],
  [["map", "location", "local", "city", "berlin", "aachen"], "MapPin"],
  [["music", "song", "sound", "playlist"], "Music"],
  [["scissors", "cut", "edit", "editing", "trim"], "Scissors"],
  [["wrench", "fix", "repair", "settings", "config"], "Wrench"],
  [["package", "product", "offer", "bundle", "delivery", "deliver"], "Package"],
  [["cart", "shop", "shopping", "buy", "sell", "selling", "sales"], "ShoppingCart"],
  [["receipt", "billing", "subscription", "abo", "plan"], "Receipt"],
  [["crown", "premium", "pro", "expert", "senior", "authority"], "Crown"],
  [["puzzle", "system", "framework", "structure", "process"], "Puzzle"],
  [["refresh", "repeat", "again", "loop", "cycle", "review"], "RefreshCw"],
  [["timer", "stopwatch", "seconds", "minutes"], "Timer"],
  [["award", "medal", "certified", "verified", "proof"], "Award"],
  [["sparkle", "magic", "wow", "surprise"], "Sparkles"],
  [["hourglass", "wait", "waiting", "patience", "later"], "Hourglass"],
  [["door", "open", "opening", "start", "begin", "onboarding"], "DoorOpen"],
  [["sofa", "comfort", "comfortable", "lazy", "easy"], "Sofa"],
  [["ghost", "ghostwriter", "invisible", "anonymous"], "Ghost"],
  [["gauge", "measure", "measured", "benchmark", "performance"], "Gauge"],
  [["infinity", "unlimited", "forever", "endless"], "Infinity"],
  [["scale", "balance", "fair", "compare", "vs", "versus"], "Scale"],
];

const DEFAULT_BY_TYPE: Record<SlideType, string[]> = {
  hook: ["Sparkles", "Zap", "Lightbulb"],
  point: ["ArrowRight", "CheckCircle2", "Target"],
  quote: ["Quote", "MessageCircle", "PenLine"],
  list: ["ListChecks", "Layers", "NotebookPen"],
  cta: ["Bookmark", "UserPlus", "Heart"],
};

export const CURATED_ICONS = Array.from(
  new Set([...KEYWORDS.map(([, icon]) => icon), ...Object.values(DEFAULT_BY_TYPE).flat()]),
).filter((name) => name in icons);

function slideWords(slide: Slide) {
  const text = [
    stripRich(slide.headline),
    stripRich(slide.headline), // headline counts double
    slide.body,
    ...(slide.bullets ?? []).flatMap((b) => [b.title, b.text]),
  ].join(" ");
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}%€$\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Icon names that fit the slide, best first, unique, at least the type defaults. */
export function findDetailIcons(slide: Slide, limit = 8): string[] {
  const words = slideWords(slide);
  const scores = new Map<string, number>();
  for (const [terms, icon] of KEYWORDS) {
    if (!(icon in icons)) continue;
    let score = 0;
    words.forEach((w, i) => {
      if (terms.includes(w)) score += i < 24 ? 3 : 1;
      else if (w.length > 4 && terms.some((t) => t.length > 4 && (w.startsWith(t) || t.startsWith(w)))) score += 1;
    });
    if (score) scores.set(icon, (scores.get(icon) ?? 0) + score);
  }
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([icon]) => icon);
  const out: string[] = [];
  for (const name of [...ranked, ...DEFAULT_BY_TYPE[slide.type]]) {
    if (!out.includes(name) && name in icons) out.push(name);
    if (out.length >= limit) break;
  }
  return out;
}

/* -------------------------------------------------------------------- stat */

const NUMBER_RE = /(?:[+\-−]\s?)?(?:€|\$|£)?\s?\d[\d.,]*\s?(?:%|k|K|x|×|GB|TB|€|\$|£)?/g;

function cleanNumber(raw: string) {
  return raw.replace(/\s+/g, "").replace("−", "-").replace("x", "×");
}

function numericValue(raw: string) {
  const n = parseFloat(raw.replace(/[^\d.,-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export type StatDetail = Extract<Detail, { kind: "stat" }>;

/** A stat graphic from the most prominent figure in the slide, or null. */
export function statFromSlide(slide: Slide): StatDetail | null {
  const sources = [stripRich(slide.headline), slide.body, ...(slide.bullets ?? []).map((b) => `${b.title} ${b.text}`)];
  type Hit = { value: string; label: string; weight: number; num: number; pct: boolean };
  const hits: Hit[] = [];
  sources.forEach((text, si) => {
    for (const m of text.matchAll(NUMBER_RE)) {
      const raw = m[0].trim();
      if (!/\d/.test(raw)) continue;
      const value = cleanNumber(raw);
      const unit = /%|€|\$|£|k|K|×|GB|TB/.test(value);
      const num = numericValue(value);
      // Plain small integers ("3 slides", "1 in 10") are rarely the headline stat.
      if (!unit && (num < 10 || /^\d{1,2}$/.test(value))) continue;
      const words = text.replace(raw, "◆").replace(/\s+/g, " ").trim();
      const label = labelAround(words);
      hits.push({ value, label, weight: (unit ? 3 : 1) + (si === 0 ? 2 : 0), num, pct: value.includes("%") });
    }
  });
  if (!hits.length) return null;
  hits.sort((a, b) => b.weight - a.weight);
  const best = hits[0];
  const bars: [number, number] | undefined =
    best.pct && best.num > 0 && best.num <= 300
      ? [1, 1 + best.num / 100]
      : hits.length > 1 && hits[1].num > 0 && best.num > 0
        ? best.num > hits[1].num
          ? [hits[1].num / best.num, 1]
          : [1, hits[1].num / best.num]
        : undefined;
  return { kind: "stat", value: best.value, label: best.label, ...(bars ? { bars } : {}) };
}

function labelAround(text: string) {
  const idx = text.indexOf("◆");
  const before = text.slice(0, idx).trim().split(/\s+/).filter(Boolean);
  const after = text.slice(idx + 1).trim().replace(/^[,.:;–—-]\s*/, "").split(/\s+/).filter(Boolean);
  const pick = after.length >= 3 ? after.slice(0, 6) : [...before.slice(-3), ...after.slice(0, 3)];
  return pick.join(" ").replace(/[.,;:]+$/, "").trim() || "at a glance";
}

/** Stat when the copy carries a figure, otherwise the best icon. */
export function autoDetail(slide: Slide): Detail {
  return statFromSlide(slide) ?? { kind: "icon", name: findDetailIcons(slide, 1)[0] ?? "Sparkles" };
}

/* ------------------------------------------------------------------- icons */

export function iconNode(name: string): IconNode | null {
  return (icons as Record<string, IconNode>)[name] ?? null;
}

/** Lucide's node list as SVG markup — used for exports and data URLs. */
export function iconSvgMarkup(name: string, color: string, size: number, strokeWidth = 1.5) {
  const node = iconNode(name);
  if (!node) return "";
  const children = node
    .map(([tag, attrs]) => {
      const a = Object.entries(attrs)
        .map(([k, v]) => `${k}="${String(v).replace(/"/g, "&quot;")}"`)
        .join(" ");
      return `<${tag} ${a}/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
}

export function iconDataUrl(name: string, color: string, size: number, strokeWidth = 1.5) {
  const svg = iconSvgMarkup(name, color, size, strokeWidth);
  return svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : "";
}

/** Human label for a Lucide icon name: "HardDrive" → "Hard drive". */
export function iconLabel(name: string) {
  return name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/(\D)(\d)/g, "$1 $2").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}
