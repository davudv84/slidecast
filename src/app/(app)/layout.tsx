"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutTemplate, LayoutGrid, Settings } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { PLAN_USAGE } from "@/lib/data";
import { initials } from "@/lib/initials";
import { ThemeToggle, Wordmark } from "@/components/brand";
import { Meter } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Carousels", Icon: LayoutGrid },
  { href: "/templates", label: "Templates", Icon: LayoutTemplate },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile } = useApp();

  return (
    <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-1 border-r border-line bg-surface p-4 md:flex">
        <Wordmark className="px-2 pb-[18px] pt-1.5" />
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-control px-2.5 text-sm font-medium transition-colors duration-150 ease-out hover:bg-hover",
                active ? "bg-hover text-t1" : "text-t2 hover:text-t1",
              )}
            >
              <Icon size={20} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-card border border-line p-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-t2">{PLAN_USAGE.plan} · this month</span>
              <span className="font-medium">
                {PLAN_USAGE.used} / {PLAN_USAGE.quota}
              </span>
            </div>
            <Meter percent={(PLAN_USAGE.used / PLAN_USAGE.quota) * 100} />
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 rounded-control px-2 py-1.5 text-t1 transition-colors duration-150 ease-out hover:bg-hover hover:text-t1"
          >
            <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-inv text-xs font-semibold text-inv-t">
              {initials(profile.name)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-[13px] font-medium">{profile.name}</span>
              <span className="truncate text-xs text-t3">{profile.email}</span>
            </div>
            <ThemeToggle size="iconSm" />
          </Link>
        </div>
      </aside>

      <main className="flex min-w-0 flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-line bg-surface px-4 py-2.5 md:hidden">
          <Wordmark size={20} />
          <div className="flex gap-1">
            {NAV.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex h-8 items-center rounded-control px-2.5 text-[13px] font-medium",
                    active ? "bg-hover text-t1" : "text-t2",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
