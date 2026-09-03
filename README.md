# Slidecast

Turn one idea into an Instagram carousel in under a minute. Paste a tweet, a
note, or 2,000 words → get 5–10 branded slides → edit on the canvas → export
1080×1350 PNGs (zipped, with a caption file) or a LinkedIn-ready PDF.

Built with Next.js 15 (App Router), TypeScript, Tailwind v4, shadcn-style
primitives on Radix, Lucide, Framer Motion and dnd-kit.

## Screens

| Route        | What it does                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| `/`          | Marketing page — live hero carousel, three feature sections built from real UI, pricing, FAQ                    |
| `/signin`, `/signup` | Split-layout auth (mocked — any email signs in)                                                         |
| `/dashboard` | Your carousels: thumbnails, status chips, search, duplicate, delete with undo                                    |
| `/editor`    | The core: slide rail (drag to reorder), 1080×1350 canvas with double-click editing, Content / Style / Brand inspector. On phones the same editor runs full-width with a thumbnail strip and bottom sheets for Text / Style / Brand / Slides |
| `/templates` | 22 templates across Studio / Minimal / Bold / Editorial / Playful; hover pages through three slides             |
| `/settings`  | Profile, accent colour, brand kit (logo, handle, colours, presets), connected channels, billing                  |
| `/share#…`   | Public read-only viewer — the whole carousel travels in the URL fragment, no server needed                      |

Keyboard: `⌘K` command palette · `←/→` switch slides · `⌘S` save · `⌘E` export · `Esc` closes overlays.

## The slide

Every slide carries a tweet-style header (avatar or logo, "Name | brand",
handle, page counter), a headline whose `*accent word*` is set in an italic
serif and the accent colour, an accent square, optional list items with
square markers, and a "Swipe →" hint on every slide but the last. The
on-screen canvas (`components/slide-canvas.tsx`) and the export renderer
(`lib/render-slide.ts`) share `lib/slide-layout.ts`, so exports match the
editor pixel for pixel.

## What is real

- **Export** renders every slide with the Canvas 2D API from the same layout
  constants the on-screen canvas uses, then writes a dependency-free ZIP
  (`lib/zip.ts`) or a minimal PDF with JPEG pages (`lib/pdf.ts`).
- **Brand kit** — uploaded logos are downscaled to a data URL and printed in the
  footer of every slide, on screen and in exports. Brand colours become slide
  colour schemes. Accent colour re-tokens the whole UI at runtime.
- **Generation** drafts hook / points / CTA from the pasted text, in the chosen
  tone, with your handle on the last slide (`lib/generator.ts`). It runs
  locally with a streamed reveal — swap in a model call behind the same function
  when you add a backend.
- **Persistence** — the workspace (carousels, brand kit, presets, accent,
  channels) lives in `localStorage` under a versioned key. There is no
  backend, auth, or database yet by design.

## What is simulated

- **Instagram publishing** — connecting an account and the publish steps
  (upload, create carousel, attach caption) run as a timed sequence in the
  browser. Real posting needs Meta's Graph API behind a server: an OAuth
  callback, a token store, and public URLs for the rendered PNGs. The UI,
  state (`channels`, `caption`, `publishedAt`) and caption drafting
  (`lib/caption.ts`) are the real thing; swap the two mocked calls in
  `app-provider.tsx` (`connectChannel`, `publish`) for API calls when a backend
  exists. Until then, "Download all as .zip" plus "Copy" caption is the path
  that posts for real.
- **Sign in** accepts any email; **billing** and **Buffer scheduling** are
  static.

## Design tokens

Every UI colour comes from `src/app/tokens.css`. Slide artwork colours
(templates, brand colours, schemes) live in `src/lib/data.ts` — they are
content, not chrome. Dark mode is the same token set inverted under
`[data-theme="dark"]`.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run typecheck
```

## Deploy

The app is a static-capable Next.js build with no environment variables.
`vercel` (or connecting the repo in the Vercel dashboard) deploys it as-is.

## Design handoff

The original Claude Design bundle (prototype, transcript) is kept in
`design-handoff/` for reference.
