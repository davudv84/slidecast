"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Bookmark, Trash2 } from "lucide-react";
import { useApp } from "../app-provider";
import { FONTS, FONT_PAIR_LABELS, SCHEMES, TEMPLATES } from "@/lib/data";
import { contrastText } from "@/lib/color";
import { Button } from "../ui/button";
import { Field, Input, Textarea } from "../ui/input";
import { Select } from "../ui/select";
import { Segmented } from "../ui/segmented";
import { LogoUploader } from "../logo-uploader";
import { BrandColors } from "../brand-colors";
import type { Align, FontPair, Scheme, SlideType } from "@/lib/types";

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

function ContentTab() {
  const app = useApp();
  const slide = app.activeSlide;

  return (
    <>
      <Field label="Slide type">
        <Select
          ariaLabel="Slide type"
          value={slide.type}
          onValueChange={(type) => app.updateActive({ type })}
          options={SLIDE_TYPES}
        />
      </Field>
      <Field label="Headline">
        <Textarea
          key={`h${slide.id}`}
          defaultValue={slide.headline}
          rows={3}
          onBlur={(e) => {
            if (e.target.value !== slide.headline) app.updateActive({ headline: e.target.value });
          }}
        />
      </Field>
      <Field label="Body">
        <Textarea
          key={`b${slide.id}`}
          defaultValue={slide.body}
          rows={5}
          onBlur={(e) => {
            if (e.target.value !== slide.body) app.updateActive({ body: e.target.value });
          }}
        />
      </Field>
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

function schemeMatches(a: Scheme | null, b: Scheme) {
  return !!a && a.bg.toUpperCase() === b.bg.toUpperCase() && a.fg.toUpperCase() === b.fg.toUpperCase();
}

function StyleTab() {
  const app = useApp();
  const brandSchemes: Scheme[] = app.brand.colors.map((c) => ({
    name: `Brand ${c}`,
    bg: c,
    fg: contrastText(c),
  }));

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
                className="flex cursor-pointer items-end rounded-control border-2 p-2 text-left text-[9px] leading-tight tracking-[-0.02em] transition-colors duration-150 ease-out hover:border-t3"
                style={{
                  aspectRatio: "4 / 5",
                  borderColor: selected ? "var(--accent)" : "var(--border)",
                  background: t.bg,
                  color: t.fg,
                  fontFamily: FONTS[t.font],
                  fontWeight: t.weight,
                }}
              >
                {t.name}
              </button>
            );
          })}
        </div>
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
    </>
  );
}

function BrandTab() {
  const app = useApp();

  return (
    <>
      <LogoUploader />

      <Field label="Handle" hint="Printed in the footer of every slide.">
        <Input
          value={app.brand.handle}
          onChange={(e) => app.updateBrand({ handle: e.target.value })}
          className="h-9"
          spellCheck={false}
        />
      </Field>

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
