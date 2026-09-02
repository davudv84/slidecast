"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useApp } from "./app-provider";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <span
      className="grid place-items-center rounded-[6px] bg-accent"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--accent-fg)"
        strokeWidth={2.5}
        strokeLinecap="round"
        aria-hidden
      >
        <rect x="3" y="5" width="12" height="14" rx="2" />
        <path d="M19 8v8" />
      </svg>
    </span>
  );
}

export function Wordmark({
  href = "/",
  className,
  size = 22,
}: {
  href?: string;
  className?: string;
  size?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-fit items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-t1 hover:text-t1",
        className,
      )}
    >
      <LogoMark size={size} />
      Slidecast
    </Link>
  );
}

export function ThemeToggle({
  size = "icon",
  className,
}: {
  size?: "icon" | "iconSm";
  className?: string;
}) {
  const { theme, toggleTheme } = useApp();
  return (
    <Button
      variant={size === "iconSm" ? "ghost" : "secondary"}
      size={size}
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
    >
      {theme === "dark" ? (
        <Sun size={16} strokeWidth={1.5} />
      ) : (
        <Moon size={16} strokeWidth={1.5} />
      )}
    </Button>
  );
}
