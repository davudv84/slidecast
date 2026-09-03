"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, type TargetAndTransition } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const EASE = [0.2, 0.8, 0.2, 1] as const;

type Placement = "center" | "top" | "right" | "bottom";

const panelMotion: Record<
  Placement,
  {
    initial: TargetAndTransition;
    animate: TargetAndTransition;
    exit: TargetAndTransition;
    duration: number;
  }
> = {
  center: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
    duration: 0.2,
  },
  top: {
    initial: { opacity: 0, scale: 0.97, y: -6 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.97, y: -6 },
    duration: 0.2,
  },
  right: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    duration: 0.2,
  },
  bottom: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    duration: 0.24,
  },
};

const wrapperClass: Record<Placement, string> = {
  center: "fixed inset-0 grid place-items-center p-4",
  top: "fixed inset-0 flex items-start justify-center px-4 pt-[12vh]",
  right: "fixed inset-0 flex justify-end",
  bottom: "fixed inset-0 flex items-end justify-center",
};

export function Modal({
  open,
  onOpenChange,
  placement = "center",
  className,
  scrim = "bg-scrim",
  zIndex = 50,
  role,
  label,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placement?: Placement;
  className?: string;
  scrim?: string;
  zIndex?: number;
  role?: "dialog" | "alertdialog";
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  const m = panelMotion[placement];
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={cn("fixed inset-0", scrim)}
                style={{ zIndex }}
              />
            </DialogPrimitive.Overlay>
            <div
              className={cn("pointer-events-none", wrapperClass[placement])}
              style={{ zIndex }}
            >
              <DialogPrimitive.Content
                asChild
                forceMount
                role={role ?? "dialog"}
                aria-label={label}
                aria-describedby={undefined}
              >
                <motion.div
                  initial={m.initial}
                  animate={m.animate}
                  exit={m.exit}
                  transition={{ duration: m.duration, ease: EASE }}
                  className={cn("pointer-events-auto", className)}
                >
                  <DialogPrimitive.Title className="sr-only">
                    {label}
                  </DialogPrimitive.Title>
                  {description ? (
                    <DialogPrimitive.Description className="sr-only">
                      {description}
                    </DialogPrimitive.Description>
                  ) : null}
                  {children}
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

export function ModalHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="m-0 text-xl font-semibold tracking-[-0.02em]">{title}</h2>
      <Button
        variant="ghost"
        size="iconSm"
        aria-label="Close"
        onClick={onClose}
      >
        <X size={16} strokeWidth={1.5} />
      </Button>
    </div>
  );
}
