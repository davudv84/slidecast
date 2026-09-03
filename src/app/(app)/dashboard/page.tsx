"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, LayoutGrid, Plus, Search, Trash2 } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { docStyle } from "@/lib/doc-style";
import { relativeTime } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, Skeleton } from "@/components/ui/misc";
import { SlidePreview } from "@/components/slide-preview";
import { cn } from "@/lib/utils";
import type { Doc } from "@/lib/types";

const GRID = "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4";

export default function DashboardPage() {
  const app = useApp();
  const [query, setQuery] = useState("");
  const [settled, setSettled] = useState(false);

  // Skeletons for the first paint; content lands once the workspace is read.
  useEffect(() => {
    const id = setTimeout(() => setSettled(true), 700);
    return () => clearTimeout(id);
  }, []);
  const loading = !settled || !app.hydrated;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return app.docs.filter((d) => d.title.toLowerCase().includes(q));
  }, [app.docs, query]);

  return (
    <div className="anim-fade flex flex-col">
      <div className="sticky top-0 z-5 flex items-center gap-2 border-b border-line bg-surface px-4 py-3 sm:gap-3 sm:px-6">
        <h1 className="m-0 mr-auto text-xl font-semibold">Carousels</h1>
        <div className="relative w-full max-w-70 flex-1 sm:w-70 sm:flex-none">
          <Search
            size={16}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-2.5 top-2.5 text-t3"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search… ⌘K"
            aria-label="Search carousels"
            className="h-9 pl-8 text-sm"
          />
        </div>
        <Button variant="primary" onClick={() => app.createDoc({ withAi: true })}>
          <Plus size={16} strokeWidth={2} />
          <span className="hidden sm:inline">New carousel</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className={GRID}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="overflow-hidden rounded-card border border-line bg-surface">
                <Skeleton className="aspect-[4/5] rounded-none" />
                <div className="flex flex-col gap-2 p-3.5">
                  <Skeleton className="h-3.5 w-[70%]" />
                  <Skeleton className="h-3 w-[45%]" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className={GRID}>
            {filtered.map((doc) => (
              <ProjectCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <EmptyState
            query={query}
            onClear={() => setQuery("")}
            onCreate={() => app.createDoc({ withAi: true })}
          />
        )}
      </div>
    </div>
  );
}

function ProjectCard({ doc }: { doc: Doc }) {
  const app = useApp();
  const style = docStyle(doc);
  const cover = doc.slides[0];

  const open = () => app.openDoc(doc.id);

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    app.requestConfirm({
      title: "Delete carousel?",
      body: `“${doc.title}” and its ${doc.slides.length} slides will be permanently deleted.`,
      cta: "Delete carousel",
      run: () => app.deleteDoc(doc.id),
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors duration-150 ease-out hover:border-t3"
    >
      {cover ? (
        <SlidePreview slide={cover} style={style} chrome={app.chromeFor(0, doc.slides.length)} />
      ) : (
        <div className="bg-shell" style={{ aspectRatio: "1080 / 1350" }} />
      )}
      <div className="flex flex-col gap-1.5 border-t border-line p-3 sm:p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium">{doc.title}</span>
          <Badge
            className={cn(
              doc.status === "Published" && "text-t1",
              doc.status === "Scheduled" && "bg-accent-soft text-accent",
            )}
          >
            {doc.status}
          </Badge>
        </div>
        <div className="flex justify-between text-[13px] text-t3">
          <span>{doc.slides.length} slides</span>
          <span>{relativeTime(doc.updatedAt)}</span>
        </div>
      </div>
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-150 ease-out focus-within:opacity-100 group-hover:opacity-100">
        <Button
          variant="secondary"
          size="iconSm"
          aria-label={`Duplicate ${doc.title}`}
          onClick={(e) => {
            e.stopPropagation();
            app.duplicateDoc(doc.id);
          }}
        >
          <Copy size={14} strokeWidth={1.5} />
        </Button>
        <Button
          variant="secondary"
          size="iconSm"
          aria-label={`Delete ${doc.title}`}
          onClick={confirmDelete}
          className="hover:text-danger"
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}

function EmptyState({
  query,
  onClear,
  onCreate,
}: {
  query: string;
  onClear: () => void;
  onCreate: () => void;
}) {
  const searching = query.trim().length > 0;
  return (
    <div className="anim-fade flex flex-col items-center gap-3.5 rounded-card border border-dashed border-line px-6 py-16 text-center">
      <LayoutGrid size={24} strokeWidth={1.5} className="text-t3" />
      <p className="m-0 text-t2">
        {searching
          ? `No carousels match “${query}”.`
          : "No carousels yet. Paste an idea and get 8 slides in under a minute."}
      </p>
      <Button variant="primary" onClick={searching ? onClear : onCreate}>
        {searching ? "Clear search" : "New carousel"}
      </Button>
    </div>
  );
}
