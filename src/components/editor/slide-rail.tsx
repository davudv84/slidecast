"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useApp } from "../app-provider";
import { Button } from "../ui/button";
import type { Slide } from "@/lib/types";

export function SlideRail() {
  const app = useApp();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = app.doc.slides.findIndex((s) => s.id === active.id);
    const to = app.doc.slides.findIndex((s) => s.id === over.id);
    if (from >= 0 && to >= 0) app.reorderSlides(from, to);
  };

  return (
    <aside className="flex min-h-0 flex-col border-r border-line bg-surface">
      <div className="flex items-center justify-between px-4 pb-2 pt-3 text-[13px] text-t2">
        <span>Slides · {app.doc.slides.length}</span>
        <Button variant="ghost" size="iconSm" className="h-6 w-6" aria-label="Add slide" onClick={app.addSlide}>
          <Plus size={16} strokeWidth={2} />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 pb-4 pt-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={app.doc.slides.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {app.doc.slides.map((slide, index) => (
              <RailItem key={slide.id} slide={slide} index={index} />
            ))}
          </SortableContext>
        </DndContext>

        <button
          type="button"
          onClick={app.addSlide}
          className="ml-6 h-9 cursor-pointer rounded-control border border-dashed border-line bg-transparent text-[13px] text-t2 transition-colors duration-150 ease-out hover:border-accent hover:text-accent"
        >
          + Add slide
        </button>
      </div>
    </aside>
  );
}

function RailItem({ slide, index }: { slide: Slide; index: number }) {
  const app = useApp();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id,
  });

  const isActive = index === app.active;
  const { style } = app;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 1 : undefined,
        position: "relative",
      }}
      className="group flex items-start gap-2"
    >
      <span className="w-4 pt-1 text-right text-xs text-t3">{index + 1}</span>

      <div
        {...attributes}
        {...listeners}
        role="button"
        tabIndex={0}
        aria-label={`Slide ${index + 1}: ${slide.headline}`}
        aria-current={isActive ? "true" : undefined}
        onClick={() => app.setActive(index)}
        onKeyDown={(e) => {
          if (e.key === "Enter") app.setActive(index);
        }}
        className="relative flex-1 cursor-grab overflow-hidden rounded-control border-2 transition-colors duration-150 ease-out active:cursor-grabbing"
        style={{
          aspectRatio: "1080 / 1350",
          borderColor: isActive ? "var(--accent)" : "var(--border)",
          background: style.bg,
          color: style.fg,
          fontFamily: style.fontFamily,
          padding: "10%",
          display: "flex",
          flexDirection: "column",
          justifyContent: style.justify,
          textAlign: style.align,
          fontSize: 9,
          fontWeight: style.weight,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        {slide.headline}

        <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity duration-150 ease-out focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            aria-label={`Duplicate slide ${index + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              app.duplicateSlide(index);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="grid h-[22px] w-[22px] cursor-pointer place-items-center rounded-[4px] border border-line bg-surface text-t2 transition-colors duration-150 ease-out hover:text-t1"
          >
            <Copy size={12} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label={`Delete slide ${index + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              app.deleteSlide(index);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="grid h-[22px] w-[22px] cursor-pointer place-items-center rounded-[4px] border border-line bg-surface text-t2 transition-colors duration-150 ease-out hover:text-danger"
          >
            <Trash2 size={12} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
