import * as React from "react";
import { cn } from "@/lib/utils";

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Separator = ({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) => (
  <div
    data-orientation={orientation}
    role="separator"
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className,
    )}
    {...props}
  />
);

export { Separator };

