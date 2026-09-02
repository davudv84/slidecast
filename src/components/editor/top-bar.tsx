"use client";

import Link from "next/link";
import { ChevronLeft, Download, Link2, Loader2, Sparkles } from "lucide-react";
import { useApp } from "../app-provider";
import { Button } from "../ui/button";

export function EditorTopBar({ narrow }: { narrow: boolean }) {
  const app = useApp();

  return (
    <div className="flex h-13 flex-none items-center gap-2 border-b border-line bg-surface px-2 sm:gap-3 sm:px-3">
      <Button variant="ghost" size="iconSm" aria-label="Back to carousels" asChild>
        <Link href="/dashboard">
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Link>
      </Button>

      <input
        value={app.doc.title}
        onChange={(e) => app.setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        aria-label="Project name"
        className="h-8 min-w-0 flex-1 rounded-control border border-transparent bg-transparent px-2 text-sm font-medium text-t1 transition-colors duration-150 ease-out hover:border-line focus:border-accent focus:bg-surface focus:outline-none sm:flex-none"
        style={{
          width: narrow ? undefined : Math.max(80, Math.min(320, app.doc.title.length * 8 + 24)),
        }}
      />

      {!narrow ? (
        <span className="flex min-w-20 items-center gap-1.5 text-[13px] text-t3" aria-live="polite">
          {app.saveState === "saving" ? (
            <>
              <Loader2 size={12} strokeWidth={2} className="anim-spin" />
              Saving…
            </>
          ) : app.saveState === "saved" ? (
            "Saved"
          ) : null}
        </span>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        {!narrow ? (
          <>
            <Button variant="secondary" size="sm" onClick={app.openAi}>
              <Sparkles size={16} strokeWidth={1.5} />
              Generate
            </Button>
            <Button variant="secondary" size="sm" onClick={() => app.setPreviewOpen(true)}>
              Preview
            </Button>
            <Button variant="secondary" size="sm" onClick={app.share}>
              <Link2 size={16} strokeWidth={1.5} />
              Share
            </Button>
          </>
        ) : (
          <Button variant="secondary" size="iconSm" aria-label="Copy share link" onClick={app.share}>
            <Link2 size={16} strokeWidth={1.5} />
          </Button>
        )}
        <Button variant="primary" size="sm" onClick={() => app.setExportOpen(true)}>
          <Download size={16} strokeWidth={1.5} />
          Export
        </Button>
      </div>
    </div>
  );
}
