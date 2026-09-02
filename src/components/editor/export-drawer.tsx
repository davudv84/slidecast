"use client";

import { useApp } from "../app-provider";
import { estimateMegabytes } from "@/lib/export";
import { Modal, ModalHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { Segmented } from "../ui/segmented";
import { Meter } from "../ui/misc";
import { cn } from "@/lib/utils";
import type { ExportFormat, ExportQuality, ExportSize } from "@/lib/types";

export function ExportDrawer() {
  const app = useApp();
  const close = () => {
    if (!app.exporting) app.setExportOpen(false);
  };

  const slides = app.doc.slides.length;
  const fileCount = app.format === "PDF" ? 1 : slides;
  const dims = app.size === "Post" ? "1080×1350" : "1080×1920";
  const progress = app.exportProgress;

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
      <ModalHeader title="Export" onClose={close} />

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
        <p className="m-0 text-[13px] text-t3">
          One page per slide. Upload it as a LinkedIn document post.
        </p>
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
    </Modal>
  );
}

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
