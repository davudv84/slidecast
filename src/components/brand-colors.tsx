"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useApp } from "./app-provider";
import { DEFAULT_ACCENT } from "@/lib/data";
import { normalizeHex } from "@/lib/color";
import { cn } from "@/lib/utils";

const MAX_COLORS = 6;

/**
 * Editable brand palette. `onPick` makes swatches clickable (the editor
 * applies them to the slide); without it the row is a plain editor.
 */
export function BrandColors({
  onPick,
  selected,
  className,
}: {
  onPick?: (hex: string) => void;
  selected?: string | null;
  className?: string;
}) {
  const { brand, updateBrand, toast } = useApp();
  const [draft, setDraft] = useState(DEFAULT_ACCENT);

  const add = (value: string) => {
    const hex = normalizeHex(value);
    if (!hex) {
      toast("Enter a hex colour like #1D4ED8.");
      return;
    }
    if (brand.colors.includes(hex)) return;
    if (brand.colors.length >= MAX_COLORS) {
      toast(`Brand kits hold up to ${MAX_COLORS} colours on Pro.`);
      return;
    }
    updateBrand({ colors: [...brand.colors, hex] });
    setDraft(DEFAULT_ACCENT);
  };

  const remove = (hex: string) =>
    updateBrand({ colors: brand.colors.filter((c) => c !== hex) });

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {brand.colors.map((c) => {
        const isSelected = selected?.toUpperCase() === c.toUpperCase();
        return (
          <div key={c} className="group relative">
            <button
              type="button"
              title={c}
              aria-label={onPick ? `Use ${c} as slide colour` : c}
              aria-pressed={onPick ? isSelected : undefined}
              onClick={onPick ? () => onPick(c) : undefined}
              className={cn(
                "flex items-center gap-2 rounded-control border py-1.5 pl-1.5 pr-2.5 text-[13px] text-t1 transition-colors duration-150 ease-out",
                isSelected ? "border-accent" : "border-line",
                onPick ? "cursor-pointer hover:border-t3" : "cursor-default",
              )}
            >
              <span className="h-5 w-5 rounded-[4px] border border-line" style={{ background: c }} />
              {c}
            </button>
            <button
              type="button"
              aria-label={`Remove ${c}`}
              onClick={() => remove(c)}
              className="absolute -right-1.5 -top-1.5 grid h-4 w-4 cursor-pointer place-items-center rounded-full border border-line bg-surface text-t3 opacity-0 transition-opacity duration-150 ease-out hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
            >
              <X size={10} strokeWidth={2.5} />
            </button>
          </div>
        );
      })}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add(draft);
        }}
        className="flex items-center gap-1 rounded-control border border-dashed border-line pl-1.5 pr-1 transition-colors duration-150 ease-out focus-within:border-accent hover:border-accent"
      >
        <input
          type="color"
          value={draft}
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          aria-label="Pick a colour"
          className="h-5 w-5 cursor-pointer appearance-none rounded-[4px] border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-[4px] [&::-webkit-color-swatch]:border-0"
        />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Hex colour"
          spellCheck={false}
          className="h-8 w-[74px] border-0 bg-transparent font-mono text-[12px] text-t1 outline-none"
        />
        <button
          type="submit"
          aria-label="Add colour"
          className="grid h-6 w-6 cursor-pointer place-items-center rounded-[4px] text-t2 transition-colors duration-150 ease-out hover:bg-hover hover:text-accent"
        >
          <Plus size={14} strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}
