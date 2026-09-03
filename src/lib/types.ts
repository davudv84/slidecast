export type FontPair = "geist" | "serif" | "mono" | "grotesk";

export type TemplateStyle = "Studio" | "Minimal" | "Bold" | "Editorial" | "Playful";

export type Justify = "flex-start" | "center" | "flex-end";

export interface Template {
  id: number;
  name: string;
  style: TemplateStyle;
  bg: string;
  fg: string;
  /** Highlight colour for the accent word, bullets and swipe hint. */
  accent: string;
  font: FontPair;
  weight: number;
  justify: Justify;
}

/** A colour override that sits on top of a template. */
export interface Scheme {
  name: string;
  bg: string;
  fg: string;
}

export type SlideType = "hook" | "point" | "quote" | "list" | "cta";

/** One row of a list slide: bold title, muted explanation. */
export interface Bullet {
  title: string;
  text: string;
}

/**
 * A small visual under the text: an icon found for the copy, a stat graphic
 * generated from the numbers in it, or an uploaded picture.
 */
export type Detail =
  | { kind: "icon"; name: string }
  | { kind: "stat"; value: string; label: string; bars?: [number, number] }
  | { kind: "image"; src: string };

export interface Slide {
  id: string;
  type: SlideType;
  /** Wrap a word in *asterisks* to render it as the accent word. */
  headline: string;
  body: string;
  /** Only rendered on `list` slides. */
  bullets?: Bullet[];
  /** Full-bleed photo behind the text (data URL), with a readability overlay. */
  image?: string | null;
  /** Overlay strength 0–1; higher keeps text readable over busy photos. */
  imageOverlay?: number;
  detail?: Detail | null;
}

export type DocStatus = "Draft" | "Scheduled" | "Published";

/** One carousel project — everything needed to render and export it. */
export interface Doc {
  id: string;
  title: string;
  slides: Slide[];
  templateId: number;
  scheme: Scheme | null;
  /** Overrides the template accent when set. */
  accent: string | null;
  fontPair: FontPair;
  align: Align;
  /** Tweet-style header: avatar, name and handle on every slide. */
  header: boolean;
  /** Footer hint on every slide but the last, e.g. "Swipe". Empty hides it. */
  swipeHint: string;
  /** Post caption. Empty means "use the suggested caption". */
  caption: string;
  status: DocStatus;
  /** Set when the carousel was published through a connected channel. */
  publishedAt?: number;
  publishedTo?: string;
  createdAt: number;
  updatedAt: number;
}

/** A social account the creator has connected for publishing. */
export interface Channel {
  id: string;
  platform: "instagram";
  handle: string;
  displayName: string;
  connectedAt: number;
}

export interface BrandKit {
  name: string;
  handle: string;
  colors: string[];
  /** Data URL of the uploaded logo, downscaled on upload. */
  logo: string | null;
  logoName: string | null;
}

export interface Profile {
  name: string;
  email: string;
}

export interface Preset {
  id: string;
  name: string;
  fontLabel: string;
  a: string;
  b: string;
  templateId: number;
  font: FontPair;
  scheme: Scheme | null;
  accent?: string | null;
}

/** Everything persisted for a signed-in creator. */
export interface Workspace {
  version: 1;
  docs: Doc[];
  brand: BrandKit;
  profile: Profile;
  presets: Preset[];
  accent: string;
  channels: Channel[];
  lastOpenedId: string | null;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Trial";
}

export interface Faq {
  q: string;
  a: string;
}

export interface Plan {
  name: string;
  price: string;
  per: string;
  desc: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export type Align = "left" | "center" | "right";

export type ExportFormat = "PNG" | "PDF";
export type ExportSize = "Post" | "Story";
export type ExportQuality = "1x" | "2x" | "3x";

export type SaveState = "idle" | "saving" | "saved";

export interface Toast {
  id: number;
  message: string;
  onUndo?: () => void;
}

export interface ConfirmRequest {
  title: string;
  body: string;
  cta: string;
  run: () => void;
}
