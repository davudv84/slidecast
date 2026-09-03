"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Bookmark, GripVertical, Plus, Trash2 } from "lucide-react";
import { useApp } from "../app-provider";
import { FONTS, FONT_PAIR_LABELS, SCHEMES, TEMPLATES } from "@/lib/data";
import { contrastText, normalizeHex } from "@/lib/color";
import { Button } from "../ui/button";
import { Field, Input, Textarea } from "../ui/input";
import { Select } from "../ui/select";
import { Segmented } from "../ui/segmented";
import { Switch } from "../ui/misc";
import { LogoUploader } from "../logo-uploader";
import { BrandColors } from "../brand-colors";
import { BackgroundEditor, DetailEditor } from "./detail-editor";
import type { Align, Bullet, FontPair, Scheme, SlideType } from "@/lib/types";

const SLIDE_TYPES: { value: SlideType; label: string }[] = [
  { value: "hook", label: "Hook" },
  { value: "point", label: "Point" },
  { value: "quote", label: "Quote" },
  { value: "list", label: "List" },
  { value: "cta", label: "CTA" },
];

const FONT_PAIRS = (Object.keys(FONT_PAIR_LABELS) as FontPair[]).map((k) => ({
  value: k,
  label: FONT_PAIR_LABELS[k],
}));

export function Inspector() {
  const app = useApp();

  return (
    <aside className="flex min-h-0 flex-col border-l border-line bg-surface">
      <Tabs.Root
        value={app.tab}
        onValueChange={(v) => app.setTab(v as typeof app.tab)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <Tabs.List className="flex border-b border-line px-4">
          {(["content", "style", "brand"] as const).map((t) => (
            <Tabs.Trigger
              key={t}
              value={t}
              className="-mb-px h-11 cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-3 text-[13px] font-medium capitalize text-t2 transition-colors duration-150 ease-out hover:text-t1 data-[state=active]:border-accent data-[state=active]:text-t1"
            >
              {t}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          <Tabs.Content value="content" className="anim-fade flex flex-col gap-[18px] outline-none">
            <ContentTab />
          </Tabs.Content>
          <Tabs.Content value="style" className="anim-fade flex flex-col gap-[18px] outline-none">
            <StyleTab />
          </Tabs.Content>
          <Tabs.Content value="brand" className="anim-fade flex flex-col gap-[18px] outline-none">
            <BrandTab />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </aside>
  );
}

/* --------------------------------------------------------------- content */

export function ContentTab() {
  const app = useApp();
  const slide = app.activeSlide;

  return (
    <>
      <Field label="Slide type">
        <Select
          ariaLabel="Slide type"
          value={slide.type}
          onValueChange={(type) => {
            const patch: Parameters<typeof app.updateActive>[0] = { type };
            if (type === "list" && !slide.bullets?.length) {
              patch.bullets = [
                { title: "First point", text: "One line that explains it." },
                { title: "Second point", text: "" },
              ];
            }
            app.updateActive(patch);
          }}
          options={SLIDE_TYPES}
        />
      </Field>
      <Field
        label="Headline"
        hint="Wrap a word in *asterisks* to set it in the accent colour."
      >
        <Textarea
          key={`h${slide.id}`}
          defaultValue={slide.headline}
          rows={3}
          onBlur={(e) => {
            if (e.target.value !== slide.headline) app.updateActive({ headline: e.target.value });
          }}
        />
      </Field>
      <Field label={slide.type === "list" ? "Intro line (optional)" : "Body"}>
        <Textarea
          key={`b${slide.id}`}
          defaultValue={slide.body}
          rows={slide.type === "list" ? 2 : 5}
          onBlur={(e) => {
            if (e.target.value !== slide.body) app.updateActive({ body: e.target.value });
          }}
        />
      </Field>

      {slide.type === "list" ? <BulletsEditor key={`l${slide.id}`} /> : null}

      <DetailEditor key={`d${slide.id}`} />
      <BackgroundEditor key={`bg${slide.id}`} />

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="h-[34px] flex-1" onClick={() => app.duplicateSlide(app.active)}>
          Duplicate
        </Button>
        <Button variant="danger" size="sm" className="h-[34px] flex-1" onClick={() => app.deleteSlide(app.active)}>
          Delete slide
        </Button>
      </div>
    </>
  );
}

const MAX_BULLETS = 5;

function BulletsEditor() {
  const app = useApp();
  const slide = app.activeSlide;
  const bullets = slide.bullets ?? [];

  const set = (next: Bullet[]) => app.updateActive({ bullets: next });
  const patch = (i: number, p: Partial<Bullet>) =>
    set(bullets.map((b, j) => (j === i ? { ...b, ...p } : b)));

  return (
    <div className="flex flex-col gap-2 text-[13px] text-t2">
      <span className="flex items-center justify-between">
        List items
        <span className="text-t3">
          {bullets.length} / {MAX_BULLETS}
        </span>
      </span>
      <div className="flex flex-col gap-2">
        {bullets.map((b, i) => (
          <div
            key={i}
            className="flex gap-2 rounded-control border border-line bg-surface p-2"
          >
            <span className="mt-2.5 flex-none text-t3" aria-hidden>
              <GripVertical size={14} strokeWidth={1.5} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Input
                defaultValue={b.title}
                placeholder="Title"
                aria-label={`Item ${i + 1} title`}
                className="h-8 text-sm"
                onBlur={(e) => {
                  if (e.target.value !== b.title) patch(i, { title: e.target.value });
                }}
              />
              <Input
                defaultValue={b.text}
                placeholder="One line of explanation"
                aria-label={`Item ${i + 1} text`}
                className="h-8 text-sm"
                onBlur={(e) => {
                  if (e.target.value !== b.text) patch(i, { text: e.target.value });
                }}
              />
            </div>
            <button
              type="button"
              aria-label={`Remove item ${i + 1}`}
              onClick={() => set(bullets.filter((_, j) => j !== i))}
              className="mt-1 grid h-7 w-7 flex-none cursor-pointer place-items-center rounded-[4px] text-t3 transition-colors duration-150 ease-out hover:bg-hover hover:text-danger"
            >
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        size="sm"
        disabled={bullets.length >= MAX_BULLETS}
        onClick={() => set([...bullets, { title: `Point ${bullets.length + 1}`, text: "" }])}
      >
        <Plus size={14} strokeWidth={2} />
        Add item
      </Button>
    </div>
  );
}

/* ----------------------------------------------------------------- style */

function schemeMatches(a: Scheme | null, b: Scheme) {
  return !!a && a.bg.toUpperCase() === b.bg.toUpperCase() && a.fg.toUpperCase() === b.fg.toUpperCase();
}

export function StyleTab() {
  const app = useApp();
  const brandSchemes: Scheme[] = app.brand.colors.map((c) => ({
    name: `Brand ${c}`,
    bg: c,
    fg: contrastText(c),
  }));
  const template = TEMPLATES[app.doc.templateId];
  const accentChoices = Array.from(
    new Set([template.accent, ...app.brand.colors, "#2F6BFF", "#FDE047", "#CCFF00", "#F5F5F7"].map((c) => c.toUpperCase())),
  );

  return (
    <>
      <div className="flex flex-col gap-2 text-[13px] text-t2">
        Template
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((t) => {
            const selected = app.doc.templateId === t.id && app.doc.scheme == null;
            return (
              <button
                key={t.id}
                type="button"
                title={t.name}
                aria-pressed={selected}
                onClick={() => app.setTemplate(t.id)}
                className="relative flex cursor-pointer items-end rounded-control border-2 p-2 text-left text-[9px] leading-tight tracking-[-0.02em] transition-colors duration-150 ease-out hover:border-t3"
                style={{
                  aspectRatio: "4 / 5",
                  borderColor: selected ? "var(--accent)" : "var(--border)",
                  background: t.bg,
                  color: t.fg,
                  fontFamily: FONTS[t.font],
                  fontWeight: t.weight,
                }}
              >
                <span className="absolute left-2 top-2 h-1.5 w-1.5" style={{ background: t.accent }} />
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-[13px] text-t2">
        Accent colour
        <div className="flex flex-wrap gap-2">
          {accentChoices.map((hex) => {
            const on = app.style.accent.toUpperCase() === hex;
            return (
              <button
                key={hex}
                type="button"
                title={hex}
                aria-label={`Accent ${hex}`}
                aria-pressed={on}
                onClick={() => app.setSlideAccent(hex === template.accent.toUpperCase() ? null : hex)}
                className="h-8 w-8 cursor-pointer rounded-control border-2 transition-colors duration-150 ease-out hover:border-t3"
                style={{ background: hex, borderColor: on ? "var(--accent)" : "var(--border)" }}
              />
            );
          })}
          <AccentInput />
        </div>
        <span className="text-t3">Used for the highlighted word, list markers and the swipe hint.</span>
      </div>

      <Field label="Font pair">
        <Select ariaLabel="Font pair" value={app.doc.fontPair} onValueChange={app.setFontPair} options={FONT_PAIRS} />
      </Field>

      <div className="flex flex-col gap-2 text-[13px] text-t2">
        Colour scheme
        <div className="flex flex-wrap gap-2">
          {[...SCHEMES, ...brandSchemes].map((s) => {
            const selected = schemeMatches(app.doc.scheme, s);
            return (
              <button
                key={s.name}
                type="button"
                title={s.name}
                aria-label={s.name}
                aria-pressed={selected}
                onClick={() => app.setScheme(selected ? null : s)}
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-control border-2 transition-colors duration-150 ease-out hover:border-t3"
                style={{ background: s.bg, borderColor: selected ? "var(--accent)" : "var(--border)" }}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.fg }} />
              </button>
            );
          })}
        </div>
        {brandSchemes.length ? (
          <span className="text-t3">The last {brandSchemes.length} come from your brand kit.</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 text-[13px] text-t2">
        Alignment
        <Segmented<Align>
          ariaLabel="Text alignment"
          value={app.doc.align}
          onChange={app.setAlign}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-control border border-line p-3">
        <label className="flex items-center justify-between gap-3 text-sm text-t1">
          <span className="flex flex-col gap-0.5">
            Profile header
            <span className="text-[12px] text-t3">Avatar, name and handle on every slide.</span>
          </span>
          <Switch checked={app.doc.header} onCheckedChange={app.setHeader} ariaLabel="Show profile header" />
        </label>
        <Field label="Swipe hint" hint="Shown bottom-left on every slide except the last. Leave empty to hide.">
          <Input
            value={app.doc.swipeHint}
            onChange={(e) => app.setSwipeHint(e.target.value)}
            placeholder="Swipe"
            className="h-9 text-sm"
          />
        </Field>
      </div>
    </>
  );
}

function AccentInput() {
  const app = useApp();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("hex") as HTMLInputElement;
        const hex = normalizeHex(input.value);
        if (!hex) {
          app.toast("Enter a hex colour like #2F6BFF.");
          return;
        }
        app.setSlideAccent(hex);
        input.value = "";
      }}
      className="flex h-8 items-center gap-1 rounded-control border border-dashed border-line px-1.5 transition-colors duration-150 ease-out focus-within:border-accent"
    >
      <input
        name="hex"
        placeholder="#hex"
        aria-label="Custom accent hex"
        spellCheck={false}
        className="h-7 w-[64px] border-0 bg-transparent font-mono text-[12px] text-t1 outline-none"
      />
      <button type="submit" aria-label="Apply accent" className="grid h-6 w-6 cursor-pointer place-items-center rounded-[4px] text-t2 hover:bg-hover hover:text-accent">
        <Plus size={14} strokeWidth={2} />
      </button>
    </form>
  );
}

/* ----------------------------------------------------------------- brand */

export function BrandTab() {
  const app = useApp();

  return (
    <>
      <LogoUploader />

      <div className="grid gap-3">
        <Field label="Brand or studio name" hint="Shown after your name in the slide header.">
          <Input
            value={app.brand.name}
            onChange={(e) => app.updateBrand({ name: e.target.value })}
            placeholder="du.digital"
            className="h-9"
          />
        </Field>
        <Field label="Handle" hint="Printed in the header and on the last slide.">
          <Input
            value={app.brand.handle}
            onChange={(e) => app.updateBrand({ handle: e.target.value })}
            className="h-9"
            spellCheck={false}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-2 text-[13px] text-t2">
        Brand colours
        <BrandColors
          selected={app.doc.scheme?.bg ?? null}
          onPick={(hex) => {
            const scheme = { name: `Brand ${hex}`, bg: hex, fg: contrastText(hex) };
            app.setScheme(schemeMatches(app.doc.scheme, scheme) ? null : scheme);
          }}
        />
        <span className="text-t3">Tap a colour to use it as the slide background.</span>
      </div>

      <div className="flex flex-col gap-2 text-[13px] text-t2">
        <span className="flex items-center justify-between">
          Saved presets
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={app.savePreset}>
            <Bookmark size={14} strokeWidth={1.5} />
            Save current look
          </Button>
        </span>
        <div className="flex flex-col gap-1.5">
          {app.presets.map((p) => (
            <div key={p.id} className="group relative">
              <button
                type="button"
                onClick={() => app.applyPreset(p)}
                className="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-control border border-line bg-surface px-2.5 text-left text-[13px] text-t1 transition-colors duration-150 ease-out hover:bg-hover"
              >
                <span className="flex gap-[3px]">
                  <span className="h-3.5 w-3.5 rounded-[3px] border border-line" style={{ background: p.a }} />
                  <span className="h-3.5 w-3.5 rounded-[3px] border border-line" style={{ background: p.b }} />
                </span>
                <span className="truncate font-medium">{p.name}</span>
                <span className="ml-auto pr-6 text-t3">{p.fontLabel}</span>
              </button>
              <button
                type="button"
                aria-label={`Delete preset ${p.name}`}
                onClick={() => app.deletePreset(p.id)}
                className="absolute right-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 cursor-pointer place-items-center rounded-[4px] text-t3 opacity-0 transition-opacity duration-150 ease-out hover:bg-hover hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
              >
                <Trash2 size={13} strokeWidth={1.5} />
              </button>
            </div>
          ))}
          {app.presets.length === 0 ? (
            <span className="text-t3">Save the current template, font and colours as a preset.</span>
          ) : null}
        </div>
      </div>
    </>
  );
}
