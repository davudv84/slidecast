"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skel", className)} />;
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border border-line px-2 py-0.5 text-xs text-t2",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Switch({
  checked,
  onCheckedChange,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={ariaLabel}
      className={cn(
        "relative h-5 w-9 cursor-pointer rounded-full border-0 transition-colors duration-150 ease-out",
        checked ? "bg-accent" : "bg-line",
      )}
    >
      <SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-surface shadow-sm transition-transform duration-150 ease-out data-[state=checked]:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  );
}

export function Slider({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  ariaLabel,
}: {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  ariaLabel: string;
}) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      onValueChange={([v]) => onValueChange(v)}
      min={min}
      max={max}
      step={step}
      aria-label={ariaLabel}
      className="relative flex h-5 w-full cursor-pointer touch-none select-none items-center"
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-line">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-3.5 w-3.5 cursor-grab rounded-full border-2 border-accent bg-surface transition-shadow duration-150 ease-out hover:shadow-float active:cursor-grabbing" />
    </SliderPrimitive.Root>
  );
}

/** Progress meter used for the usage bar and generation progress. */
export function Meter({
  percent,
  className,
  barClassName,
}: {
  percent: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn("h-1 w-full rounded-full bg-line", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-accent transition-[width] duration-300 ease-out",
          barClassName,
        )}
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}
