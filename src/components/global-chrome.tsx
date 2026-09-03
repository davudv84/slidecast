"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useApp } from "./app-provider";
import { Modal, ModalHeader } from "./ui/dialog";
import { Button } from "./ui/button";
import { ConnectChannelDialog } from "./connect-channel";
import { cn } from "@/lib/utils";

export function GlobalChrome() {
  return (
    <>
      <CommandPalette />
      <ConfirmDialog />
      <ConnectChannelDialog />
      <Toaster />
      <Shortcuts />
    </>
  );
}

/* ------------------------------------------------------------------ toasts */

function Toaster() {
  const { toasts, dismissToast, exportOpen } = useApp();
  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-4 right-4 z-80 flex max-w-[calc(100vw-32px)] flex-col gap-2 pb-[env(safe-area-inset-bottom)] transition-[right] duration-200 ease-out",
        // Keep toasts clear of the export drawer's action buttons.
        exportOpen && "md:right-[416px]",
      )}
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            role="status"
            className="pointer-events-auto flex min-w-60 items-center gap-3 rounded-lg bg-inv py-2.5 pl-3.5 pr-3 text-[13px] text-inv-t shadow-float"
          >
            <span className="flex-1">{t.message}</span>
            {t.onUndo ? (
              <button
                type="button"
                onClick={() => {
                  t.onUndo?.();
                  dismissToast(t.id);
                }}
                className="h-[26px] cursor-pointer rounded-[4px] border border-[var(--toast-btn-border)] px-2.5 text-[13px] font-medium transition-colors duration-150 ease-out hover:bg-[var(--toast-btn-hover)]"
              >
                Undo
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismissToast(t.id)}
              className="grid h-6 w-6 cursor-pointer place-items-center opacity-60 transition-opacity duration-150 ease-out hover:opacity-100"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------------------------------------------- confirm */

function ConfirmDialog() {
  const { confirm, cancelConfirm } = useApp();
  return (
    <Modal
      open={!!confirm}
      onOpenChange={(o) => !o && cancelConfirm()}
      role="alertdialog"
      label={confirm?.title ?? "Confirm"}
      zIndex={60}
      className="w-full max-w-100 rounded-modal border border-line bg-surface p-6 shadow-float"
    >
      <div className="flex flex-col gap-4">
        <h2 className="m-0 text-xl font-semibold">{confirm?.title}</h2>
        <p className="m-0 leading-relaxed text-t2">{confirm?.body}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={cancelConfirm}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => confirm?.run()}>
            {confirm?.cta}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------- command palette */

function CommandPalette() {
  const app = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (app.cmdOpen) setQuery("");
  }, [app.cmdOpen]);

  const items = useMemo(() => {
    const all = [
      { group: "Go to", label: "Carousels", kbd: "G D", run: () => router.push("/dashboard") },
      { group: "Go to", label: "Templates", kbd: "G T", run: () => router.push("/templates") },
      { group: "Go to", label: "Settings", kbd: "G S", run: () => router.push("/settings") },
      { group: "Go to", label: "Open editor", kbd: "G E", run: () => router.push("/editor") },
      { group: "Create", label: "New carousel with AI", kbd: "", run: () => app.createDoc({ withAi: true }) },
      { group: "Create", label: "New blank carousel", kbd: "", run: () => app.createDoc() },
      ...app.docs.slice(0, 6).map((d) => ({
        group: "Open",
        label: d.title,
        kbd: "",
        run: () => app.openDoc(d.id),
      })),
      {
        group: "Editor",
        label: "Export…",
        kbd: "⌘E",
        run: () => {
          if (pathname !== "/editor") router.push("/editor");
          app.setExportTab("download");
          app.setExportOpen(true);
        },
      },
      {
        group: "Editor",
        label: "Publish to Instagram…",
        kbd: "",
        run: () => {
          if (pathname !== "/editor") router.push("/editor");
          app.setExportTab("publish");
          app.setExportOpen(true);
        },
      },
      { group: "Account", label: "Connect Instagram", kbd: "", run: () => app.setConnectOpen(true) },
      {
        group: "Editor",
        label: "Add slide",
        kbd: "",
        run: () => {
          if (pathname !== "/editor") router.push("/editor");
          app.addSlide();
        },
      },
      { group: "Editor", label: "Copy share link", kbd: "", run: app.share },
      {
        group: "Theme",
        label: app.theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        kbd: "",
        run: app.toggleTheme,
      },
    ];
    const q = query.trim().toLowerCase();
    return all.filter((c) => c.label.toLowerCase().includes(q));
  }, [app, router, pathname, query]);

  const run = (fn: () => void) => {
    app.setCmdOpen(false);
    fn();
  };

  return (
    <Modal
      open={app.cmdOpen}
      onOpenChange={app.setCmdOpen}
      placement="top"
      scrim="bg-scrim-soft"
      zIndex={70}
      label="Command palette"
      className="w-full max-w-130 overflow-hidden rounded-modal border border-line bg-surface shadow-float"
    >
      <div className="flex items-center gap-2.5 border-b border-line px-4">
        <Search size={16} strokeWidth={1.5} className="text-t3" />
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && items[0]) run(items[0].run);
          }}
          placeholder="Type a command or search…"
          aria-label="Command palette search"
          className="h-12 flex-1 border-0 bg-transparent text-base text-t1 outline-none"
        />
        <kbd className="rounded-[4px] border border-line px-1.5 py-0.5 font-sans text-[11px] text-t3">
          Esc
        </kbd>
      </div>
      <div className="flex max-h-80 flex-col overflow-y-auto p-2">
        {items.map((c, i) => (
          <button
            key={c.group + c.label}
            type="button"
            onClick={() => run(c.run)}
            className={cn(
              "flex h-10 cursor-pointer items-center gap-2.5 rounded-control px-2.5 text-left text-sm text-t1 transition-colors duration-150 ease-out hover:bg-hover",
              i === 0 && "bg-hover",
            )}
          >
            <span className="w-16 flex-none text-xs text-t3">{c.group}</span>
            <span className="truncate">{c.label}</span>
            <kbd className="ml-auto font-sans text-[11px] text-t3">{c.kbd}</kbd>
          </button>
        ))}
        {items.length === 0 ? (
          <p className="m-0 p-4 text-center text-[13px] text-t3">No results</p>
        ) : null}
      </div>
    </Modal>
  );
}

/* --------------------------------------------------------------- shortcuts */

function Shortcuts() {
  const app = useApp();
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName ?? "").toLowerCase();
      const typing =
        ["input", "textarea", "select"].includes(tag) || !!target?.isContentEditable;

      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        app.setCmdOpen(!app.cmdOpen);
        return;
      }

      if (e.key === "Escape") {
        // Radix closes its own dialogs; this covers the rest.
        app.setPreviewOpen(false);
        if (!app.generating) app.closeAi();
        target?.blur?.();
        return;
      }

      if (pathname !== "/editor") return;

      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        app.touch();
        return;
      }
      if (meta && e.key.toLowerCase() === "e") {
        e.preventDefault();
        app.setExportOpen(true);
        return;
      }
      if (typing) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        app.nextSlide();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        app.prevSlide();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [app, pathname]);

  return null;
}

export { ModalHeader };
