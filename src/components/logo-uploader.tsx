"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { useApp } from "./app-provider";
import { LOGO_ACCEPT, fileToLogo } from "@/lib/upload";
import { cn } from "@/lib/utils";

/** Drop zone + preview for the brand logo. Stores a small data URL. */
export function LogoUploader({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { brand, updateBrand, toast } = useApp();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  const accept = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const logo = await fileToLogo(file);
      updateBrand({ logo, logoName: file.name });
      toast("Logo updated on every slide");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5 text-[13px] text-t2", className)}>
      Logo
      <input
        ref={input}
        type="file"
        accept={LOGO_ACCEPT}
        className="sr-only"
        aria-label="Upload logo"
        onChange={(e) => {
          void accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div
        role="button"
        tabIndex={0}
        aria-label={brand.logo ? "Replace logo" : "Choose a logo file"}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            input.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void accept(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-control border border-dashed px-3 text-t2 transition-colors duration-150 ease-out hover:border-accent",
          over ? "border-accent bg-accent-soft" : "border-line",
          compact ? "h-10" : "h-18 justify-center",
          brand.logo && !compact && "justify-start",
        )}
      >
        {brand.logo ? (
          <>
            <span className="grid h-8 w-8 flex-none place-items-center overflow-hidden rounded-[4px] border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brand.logo} alt="" className="max-h-7 max-w-7 object-contain" />
            </span>
            <span className="truncate text-t1">{brand.logoName ?? "logo"}</span>
            <button
              type="button"
              aria-label="Remove logo"
              onClick={(e) => {
                e.stopPropagation();
                updateBrand({ logo: null, logoName: null });
              }}
              className="ml-auto grid h-6 w-6 flex-none cursor-pointer place-items-center rounded-[4px] text-t3 transition-colors duration-150 ease-out hover:bg-hover hover:text-danger"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </>
        ) : (
          <>
            <Upload size={16} strokeWidth={1.5} className="flex-none" />
            <span className="text-[13px]">
              {busy ? "Reading…" : compact ? "Drop SVG or PNG" : "Drop SVG or PNG · shown on every slide"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
