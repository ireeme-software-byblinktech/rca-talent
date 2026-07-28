import Image from "next/image";
import { cn } from "@/lib/utils";

interface RCALogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-9 w-9",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-28 w-28",
};

const pixelSizes = {
  sm: 36,
  md: 56,
  lg: 80,
  xl: 112,
};

/** Company logo used in navbar, auth pages, and footer. */
export function RCALogo({ size = "md", className }: RCALogoProps) {
  const px = pixelSizes[size];

  return (
    <div className={cn(sizes[size], "relative shrink-0 overflow-hidden rounded-full", className)}>
      <Image
        src="/logo.png"
        alt="RCA Talent"
        width={px}
        height={px}
        priority
        className="h-full w-full object-contain"
      />
    </div>
  );
}
