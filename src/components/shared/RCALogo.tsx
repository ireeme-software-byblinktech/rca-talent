import Image from "next/image";
import { cn } from "@/lib/utils";

interface RCALogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

export function RCALogo({ size = "md", className }: RCALogoProps) {
  return (
    <div
      className={cn(
        sizes[size],
        "relative shrink-0 overflow-hidden rounded-full bg-white p-0.5 flex items-center justify-center shadow-sm",
        className
      )}
    >
      <Image
        src="/logo.png"
        alt="RCA Talent logo"
        width={112}
        height={112}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
