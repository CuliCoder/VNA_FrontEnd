import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  message,
  onClose,
  className,
}: AlertProps) {
  const variants = {
    success: {
      container: "bg-success/10 border-success/20 text-success-foreground",
      icon: <CheckCircle className="w-5 h-5 text-success" />,
      border: "border-l-success",
    },
    error: {
      container:
        "bg-destructive/10 border-destructive/20 text-destructive-foreground",
      icon: <AlertCircle className="w-5 h-5 text-destructive" />,
      border: "border-l-destructive",
    },
    warning: {
      container: "bg-warning/10 border-warning/20 text-warning-foreground",
      icon: <AlertTriangle className="w-5 h-5 text-warning" />,
      border: "border-l-warning",
    },
    info: {
      container: "bg-info/10 border-info/20 text-info-foreground",
      icon: <Info className="w-5 h-5 text-info" />,
      border: "border-l-info",
    },
  };

  const { container, icon, border } = variants[variant];

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4 border-l-4",
        container,
        border,
        className,
      )}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <h5
            className={cn(
              "font-medium leading-tight text-foreground",
              message && "mb-1",
            )}
          >
            {title}
          </h5>
          {message && (
            <div className="text-sm text-muted-foreground">{message}</div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-md inline-flex text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <span className="sr-only">Close</span>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
