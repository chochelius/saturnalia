import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export const YouTubeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    className={cn("icon-glow", props.className)}
  >
    <path d="M2.5 17a2.4 2.4 0 0 1-2-2.5V9.5A2.4 2.4 0 0 1 2.5 7h19a2.4 2.4 0 0 1 2 2.5v5a2.4 2.4 0 0 1-2 2.5h-19Z" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);
