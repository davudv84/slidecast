"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* 16px font size on inputs keeps iOS from zooming on focus. */
const fieldBase =
  "w-full rounded-control border border-line bg-surface text-t1 text-base transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-t3 " +
  "focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent-soft disabled:opacity-50 disabled:cursor-not-allowed";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, "h-10 px-3", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldBase, "resize-y px-3 py-2.5 leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-[13px] text-t2", className)}>
      {label}
      {children}
      {hint ? <span className="text-t3">{hint}</span> : null}
    </label>
  );
}
