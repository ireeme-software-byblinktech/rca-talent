import { cn } from "@/lib/utils";

interface RCALogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-20 w-20",
  xl: "h-28 w-28",
};

export function RCALogo({ size = "md", className }: RCALogoProps) {
  return (
    <svg
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizes[size], className)}
      aria-label="RCA Talent logo"
    >
      <path
        d="M60 4L112 28V72C112 104 88 128 60 136C32 128 8 104 8 72V28L60 4Z"
        fill="#1A2B4B"
        stroke="#1A2B4B"
        strokeWidth="2"
      />
      <path
        d="M60 12L104 32V70C104 98 84 118 60 124C36 118 16 98 16 70V32L60 12Z"
        fill="#1A2B4B"
      />
      <text
        x="60"
        y="52"
        textAnchor="middle"
        fill="white"
        fontSize="22"
        fontWeight="bold"
        fontFamily="monospace"
      >
        {"</>"}
      </text>
      <path
        d="M28 88 L28 78 L38 78 L38 88 L48 88 L48 98 L28 98 Z M32 82 L34 82 L34 86 L32 86 Z"
        fill="white"
      />
      <path
        d="M32 78 L38 72 L44 78 L40 78 L40 88 L36 88 L36 78 Z"
        fill="white"
      />
      <text
        x="72"
        y="98"
        fill="white"
        fontSize="16"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        RCA
      </text>
    </svg>
  );
}
