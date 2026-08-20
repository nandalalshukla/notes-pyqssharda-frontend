import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: boolean;
}

const sizeMap = {
  xs: { box: "h-6 w-6", px: 24, icon: 12 },
  sm: { box: "h-8 w-8", px: 32, icon: 14 },
  md: { box: "h-10 w-10", px: 40, icon: 18 },
  lg: { box: "h-14 w-14", px: 56, icon: 24 },
  xl: { box: "h-24 w-24", px: 96, icon: 40 },
};

export function Avatar({
  src,
  alt = "",
  size = "md",
  ring = false,
  className,
  ...props
}: AvatarProps) {
  const { box, px, icon } = sizeMap[size];
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-muted",
        box,
        ring && "ring-2 ring-background outline outline-2 outline-primary/40",
        className,
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${px}px`}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <User size={icon} />
        </div>
      )}
    </div>
  );
}
