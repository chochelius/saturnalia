import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export const SpotifyIcon = (props: SVGProps<SVGSVGElement>) => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="M15.1,17.5c-0.2,0-0.5-0.1-0.7-0.2c-2.2-1.3-5-1.6-8.3-0.9C5.9,16.5,5.7,16.3,5.6,16c-0.1-0.3,0.1-0.6,0.4-0.7 c3.6-0.8,6.8-0.5,9.3,1c0.3,0.2,0.4,0.5,0.2,0.8C15.5,17.4,15.3,17.5,15.1,17.5z" />
    <path d="M15.9,14.3c-0.2,0-0.4-0.1-0.6-0.2c-2.4-1.5-6.1-1.9-9.5-1c-0.4,0.1-0.7-0.1-0.8-0.4c-0.1-0.4,0.1-0.7,0.4-0.8 c3.8-1,7.9-0.5,10.7,1.2c0.3,0.2,0.4,0.6,0.2,0.9C16.4,14.2,16.1,14.3,15.9,14.3z" />
    <path d="M16.9,11c-0.2,0-0.5-0.1-0.7-0.3c-2.8-1.7-7.2-2.1-10.7-1.2c-0.4,0.1-0.8-0.1-0.9-0.5c-0.1-0.4,0.1-0.8,0.5-0.9 c4-1,8.8-0.5,12,1.5c0.3,0.2,0.5,0.6,0.3,1C17.4,10.9,17.2,11,16.9,11z" />
  </svg>
);
