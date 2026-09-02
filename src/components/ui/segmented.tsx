"use client";

import { cn } from "@/lib/utils";

/**
 * Segmented control — the inset pill row used for template filters,
 * alignment and export quality.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-0.5 rounded-control border border-line bg-shell p-[3px]",
        className,
      )}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-7 flex-1 cursor-pointer rounded-[4px] px-2.5 text-[13px] font-medium transition-colors duration-150 ease-out",
              on
                ? "bg-surface text-t1"
                : "bg-transparent text-t2 hover:text-t1",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
