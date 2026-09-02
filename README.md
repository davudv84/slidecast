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
| `/editor`    | The core: slide rail (drag to reorder), 1080×1350 canvas with double-click editing, Content / Style / Brand inspector |
| `/templates` | 20 templates across Minimal / Bold / Editorial / Playful; hover pages through three slides                      |
| `/settings`  | Profile, accent colour, brand kit (logo, handle, colours, presets), billing                                      |
| `/share#…`   | Public read-only viewer — the whole carousel travels in the URL fragment, no server needed                      |

Keyboard: `⌘K` command palette · `←/→` switch slides · `⌘S` save · `⌘E` export · `Esc` closes overlays.

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
- **Persistence** — the workspace (carousels, brand kit, presets, accent) lives
  in `localStorage` under a versioned key. There is no backend, auth, or
  database yet by design.

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
