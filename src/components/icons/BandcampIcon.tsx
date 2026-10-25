import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export const BandcampIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
    className={cn("icon-glow", props.className)}
  >
    <path d="M0 18.75l7.437-13.5h16.563l-7.437 13.5z" />
  </svg>
);
