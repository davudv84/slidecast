"use client";

import { useState } from "react";
import { Check, Copy, Instagram, RotateCcw } from "lucide-react";
import { useApp } from "../app-provider";
import { estimateMegabytes } from "@/lib/export";
import { CAPTION_MAX, suggestedCaption } from "@/lib/caption";
import { Modal, ModalHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { Segmented } from "../ui/segmented";
import { Textarea } from "../ui/input";
import { Meter } from "../ui/misc";
import { cn } from "@/lib/utils";
import type { ExportFormat, ExportQuality, ExportSize } from "@/lib/types";

export function ExportDrawer() {
  const app = useApp();
  const busy = app.exporting || !!app.publishing;
  const close = () => {
    if (!busy) app.setExportOpen(false);
  };

  return (
      <Modal
        open={app.exportOpen}
        onOpenChange={(o) => {
          if (!o) close();
        }}
        placement="right"
        scrim="bg-scrim-soft"
        label="Export"
        className="flex h-full w-full max-w-100 flex-col gap-5 overflow-y-auto border-l border-line bg-surface p-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-float"
      >
        <ModalHeader title={app.exportTab === "publish" ? "Publish" : "Export"} onClose={close} />

        <Segmented<"download" | "publish">
          ariaLabel="Export mode"
          value={app.exportTab}
          onChange={app.setExportTab}
          options={[
            { value: "download", label: "Download" },
            { value: "publish", label: "Publish to Instagram" },
          ]}
        />

        {app.exportTab === "download" ? <DownloadPanel /> : <PublishPanel />}
      </Modal>
  );
}

/* --------------------------------------------------------------- download */

function DownloadPanel() {
  const app = useApp();
  const slides = app.doc.slides.length;
  const fileCount = app.format === "PDF" ? 1 : slides;
  const dims = app.size === "Post" ? "1080×1350" : "1080×1920";
  const progress = app.exportProgress;

  return (
    <>
      <OptionGroup label="Format">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "PNG", desc: `${slides} files · Instagram` },
              { value: "PDF", desc: "1 file · LinkedIn" },
            ] as { value: ExportFormat; desc: string }[]
          ).map((f) => (
            <OptionCard key={f.value} selected={app.format === f.value} onClick={() => app.setFormat(f.value)} disabled={app.exporting}>
              <span className="text-sm font-medium">{f.value}</span>
              <span className="text-[13px] text-t2">{f.desc}</span>
            </OptionCard>
          ))}
        </div>
      </OptionGroup>

      <OptionGroup label="Size">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "Post", dim: "1080 × 1350" },
              { value: "Story", dim: "1080 × 1920" },
            ] as { value: ExportSize; dim: string }[]
          ).map((s) => (
            <OptionCard
              key={s.value}
              selected={app.size === s.value}
              onClick={() => app.setSize(s.value)}
              disabled={app.exporting}
              className="items-center p-2.5 text-center"
            >
              <span className="text-sm font-medium">{s.value}</span>
              <span className="text-xs text-t2">{s.dim}</span>
            </OptionCard>
          ))}
        </div>
      </OptionGroup>

      <OptionGroup label="Quality">
        <Segmented<ExportQuality>
          ariaLabel="Export quality"
          value={app.quality}
          onChange={app.setQuality}
          options={[
            { value: "1x", label: "1x" },
            { value: "2x", label: "2x" },
            { value: "3x", label: "3x" },
          ]}
        />
      </OptionGroup>

      <div className="flex justify-between rounded-control border border-line p-3 text-[13px] text-t2">
        <span>
          {fileCount} {app.format} · {dims} · {app.quality}
        </span>
        <span className="font-medium text-t1">~{estimateMegabytes(slides, app.format, app.quality)} MB</span>
      </div>

      {app.format === "PNG" ? (
        <p className="m-0 text-[13px] text-t3">
          The .zip includes a numbered PNG per slide and a caption.txt with all your copy, ready to paste.
        </p>
      ) : (
        <p className="m-0 text-[13px] text-t3">One page per slide. Upload it as a LinkedIn document post.</p>
      )}

      <div className="mt-auto flex flex-col gap-3">
        {progress ? (
          <div className="flex flex-col gap-2 text-[13px] text-t2" aria-live="polite">
            <span className="flex justify-between">
              <span>{progress.label}</span>
              <span className="tabular">
                {progress.done} / {progress.total}
              </span>
            </span>
            <Meter percent={(progress.done / Math.max(1, progress.total)) * 100} />
          </div>
        ) : null}
        <Button variant="primary" className="h-10" onClick={app.runExport} loading={app.exporting}>
          {app.exporting ? "Rendering slides…" : app.format === "PNG" ? "Download all as .zip" : "Download PDF"}
        </Button>
        <Button variant="secondary" className="h-10" onClick={app.schedule} disabled={app.exporting}>
          Schedule via Buffer
        </Button>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- publish */

function PublishPanel() {
  const app = useApp();
  const [channelId, setChannelId] = useState<string | null>(app.channels[0]?.id ?? null);
  const [copied, setCopied] = useState(false);
  const selected = app.channels.find((c) => c.id === channelId) ?? app.channels[0] ?? null;
  const suggested = suggestedCaption(app.doc, app.brand);
  const isCustom = app.doc.caption.trim().length > 0 && app.doc.caption !== suggested;
  const chars = app.caption.length;
  const slides = app.doc.slides.length;
  const progress = app.publishing;

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(app.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      app.toast("Caption copied");
    } catch {
      app.toast("Could not copy — select the caption and copy it manually.");
    }
  };

  return (
    <>
      <OptionGroup label="Account">
        {app.channels.length ? (
          <div className="flex flex-col gap-2">
            {app.channels.map((c) => (
              <OptionCard
                key={c.id}
                selected={selected?.id === c.id}
                onClick={() => setChannelId(c.id)}
                disabled={!!progress}
                className="flex-row items-center gap-3"
              >
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-inv text-inv-t">
                  <Instagram size={15} strokeWidth={1.5} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium">{c.handle}</span>
                  <span className="text-xs text-t2">Instagram · carousel post</span>
                </span>
                {selected?.id === c.id ? <Check size={16} strokeWidth={2} className="text-accent" /> : null}
              </OptionCard>
            ))}
            <Button variant="ghost" size="sm" className="w-fit" onClick={() => app.setConnectOpen(true)}>
              + Add another account
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-control border border-dashed border-line p-4">
            <p className="m-0 text-sm text-t2">
              Connect your Instagram account once and publish every carousel from here, caption included.
            </p>
            <Button variant="primary" size="sm" className="w-fit" onClick={() => app.setConnectOpen(true)}>
              <Instagram size={14} strokeWidth={1.5} />
              Connect Instagram
            </Button>
          </div>
        )}
      </OptionGroup>

      <OptionGroup label="Caption">
        <Textarea
          key={app.doc.id}
          value={app.caption}
          onChange={(e) => app.setCaption(e.target.value.slice(0, CAPTION_MAX))}
          rows={9}
          aria-label="Caption"
          className="text-sm leading-relaxed"
          disabled={!!progress}
        />
        <div className="flex items-center justify-between text-xs text-t3">
          <span className={cn("tabular", chars > CAPTION_MAX - 100 && "text-danger")}>
            {chars} / {CAPTION_MAX}
          </span>
          <span className="flex gap-1">
            {isCustom ? (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={() => app.setCaption("")} disabled={!!progress}>
                <RotateCcw size={13} strokeWidth={1.5} />
                Reset
              </Button>
            ) : (
              <span className="self-center pr-1">Drafted from your slides</span>
            )}
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={copyCaption}>
              {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.5} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </span>
        </div>
      </OptionGroup>

      <div className="flex justify-between rounded-control border border-line p-3 text-[13px] text-t2">
        <span>
          {slides} slides · 1080×1350 · {selected ? selected.handle : "no account"}
        </span>
        <span className="font-medium text-t1">{app.doc.status}</span>
      </div>

      {app.doc.publishedAt ? (
        <p className="m-0 text-[13px] text-t3">
          Published to {app.doc.publishedTo} on{" "}
          {new Date(app.doc.publishedAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}.
          Publishing again creates a new post.
        </p>
      ) : null}

      <div className="mt-auto flex flex-col gap-3">
        {progress ? (
          <div className="flex flex-col gap-2 text-[13px] text-t2" aria-live="polite">
            <span className="flex justify-between">
              <span>{progress.label}</span>
              <span className="tabular">
                {progress.step} / {progress.steps}
              </span>
            </span>
            <Meter percent={(progress.step / progress.steps) * 100} />
          </div>
        ) : null}
        <Button
          variant="primary"
          className="h-10"
          onClick={() => selected && app.publish(selected.id)}
          disabled={!selected}
          loading={!!progress}
        >
          {progress ? "Publishing…" : selected ? `Publish to ${selected.handle}` : "Connect an account to publish"}
        </Button>
        <Button variant="secondary" className="h-10" onClick={app.schedule} disabled={!!progress}>
          Schedule for Tue 9:00
        </Button>
      </div>
    </>
  );
}

/* --------------------------------------------------------------- pieces */

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 text-[13px] text-t2">
      {label}
      {children}
    </div>
  );
}

function OptionCard({
  selected,
  onClick,
  disabled,
  className,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex cursor-pointer flex-col gap-0.5 rounded-control border p-3 text-left text-t1 transition-colors duration-150 ease-out disabled:cursor-default disabled:opacity-60",
        selected ? "border-accent bg-accent-soft" : "border-line bg-surface hover:bg-hover",
        className,
      )}
    >
      {children}
    </button>
  );
}
