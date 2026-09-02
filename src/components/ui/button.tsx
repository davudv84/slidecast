"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-control font-medium border transition-[background-color,border-color,color,opacity] duration-150 ease-out cursor-pointer disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-accent bg-accent text-accent-fg hover:bg-accent-h active:bg-accent-h",
        secondary:
          "border-line bg-surface text-t1 hover:bg-hover active:bg-hover",
        ghost:
          "border-transparent bg-transparent text-t2 hover:bg-hover hover:text-t1 active:bg-hover",
        destructive:
          "border-danger bg-danger text-danger-fg hover:opacity-90 active:opacity-90",
        danger:
          "border-line bg-surface text-danger hover:bg-hover active:bg-hover",
        link: "border-transparent bg-transparent p-0 h-auto text-accent hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-9 px-3.5 text-sm",
        lg: "h-11 px-5 text-[15px]",
        iconSm: "h-7 w-7 p-0",
        icon: "h-9 w-9 p-0",
        none: "",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild, loading, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        data-loading={loading ? "" : undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="anim-spin" size={14} strokeWidth={2} />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
