export type FontPair = "geist" | "serif" | "mono" | "grotesk";

export type TemplateStyle = "Minimal" | "Bold" | "Editorial" | "Playful";

export type Justify = "flex-start" | "center" | "flex-end";

export interface Template {
  id: number;
  name: string;
  style: TemplateStyle;
  bg: string;
  fg: string;
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

export interface Slide {
  id: string;
  type: SlideType;
  headline: string;
  body: string;
}

export type DocStatus = "Draft" | "Scheduled" | "Published";

/** One carousel project — everything needed to render and export it. */
export interface Doc {
  id: string;
  title: string;
  slides: Slide[];
  templateId: number;
  scheme: Scheme | null;
  fontPair: FontPair;
  align: Align;
  status: DocStatus;
  createdAt: number;
  updatedAt: number;
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
}

/** Everything persisted for a signed-in creator. */
export interface Workspace {
  version: 1;
  docs: Doc[];
  brand: BrandKit;
  profile: Profile;
  presets: Preset[];
  accent: string;
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
