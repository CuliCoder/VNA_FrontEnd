import { Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountInfoFieldProps {
  label: string;
  value: string;
  editable?: boolean;
  onEdit?: () => void;
  className?: string;
}

export function AccountInfoField({
  label,
  value,
  editable,
  onEdit, 
  className,
}: AccountInfoFieldProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between py-3 border-b border-border last:border-0",
        className
      )}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 w-full">
        <span className="text-sm font-medium text-muted-foreground min-w-[120px]">
          {label}
        </span>
        <span className="text-sm text-foreground font-medium">{value}</span>
      </div>
      {editable && onEdit && (
        <button
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-foreground focus:opacity-100 transition-opacity focus:outline-none rounded-md hover:bg-muted"
          aria-label={`Edit ${label}`}
        >
          <Edit2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
