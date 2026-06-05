import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
}

export function Avatar({ src, name, size = "md", online, className }: AvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
  };

  const getInitials = (n?: string) => {
    if (!n) return "?";
    return n.substring(0, 2).toUpperCase();
  };

  return (
    <div className={cn("relative inline-flex", className)}>
      <div
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-muted/30 border border-border/50 shadow-sm",
          sizeClasses[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name || "Avatar"}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-medium text-muted-foreground bg-secondary">
            {getInitials(name)}
          </div>
        )}
      </div>
      {online && (
        <span
          className="absolute bottom-0 right-0 block rounded-full bg-success ring-2 ring-background"
          style={{ width: "25%", height: "25%", minWidth: "8px", minHeight: "8px" }}
        />
      )}
    </div>
  );
}
