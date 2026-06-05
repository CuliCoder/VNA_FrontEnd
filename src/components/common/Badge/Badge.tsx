import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  label: string;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ variant = "default", label, size = "md", className }: BadgeProps) {
  const variants = {
    default: "bg-secondary text-secondary-foreground border-border",
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {label}
    </span>
  );
}
