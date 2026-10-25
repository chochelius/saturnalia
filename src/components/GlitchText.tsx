import { cn } from "@/lib/utils";
import type { ElementType, HTMLAttributes } from "react";

interface GlitchTextProps extends HTMLAttributes<HTMLElement> {
  text: string;
  as?: ElementType;
}

export const GlitchText = ({
  text,
  as: Component = "h2",
  className,
  ...props
}: GlitchTextProps) => {
  return (
    <Component
      className={cn("relative font-headline uppercase select-none", className)}
      {...props}
    >
      <span
        className="absolute left-0 top-0 w-full h-full bg-transparent text-primary animate-glitch-1"
        aria-hidden="true"
      >
        {text}
      </span>
      <span className="animate-glitch-skew text-accent">{text}</span>
      <span
        className="absolute left-0 top-0 w-full h-full bg-transparent text-secondary animate-glitch-2"
        aria-hidden="true"
      >
        {text}
      </span>
    </Component>
  );
};
