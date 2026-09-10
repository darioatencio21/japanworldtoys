import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "bg-jw-gray-100 text-jw-gray-700",
        red: "bg-jw-red text-white",
        gold: "bg-jw-gold text-jw-black",
        outline: "border border-jw-gray-200 text-jw-gray-500",
        success: "bg-jw-success text-white",
        warning: "bg-jw-warning text-jw-black",
        error: "bg-jw-error text-white",
        info: "bg-jw-info text-white",
        nuevo: "bg-jw-red text-white",
        preventa: "bg-jw-gold text-jw-black",
        exclusivo: "bg-jw-gold text-jw-black",
        oferta: "bg-jw-error text-white",
        "pocas-unidades": "bg-jw-warning text-jw-black",
        "sin-stock": "bg-jw-gray-500 text-white",
        proximamente: "bg-jw-gray-700 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
