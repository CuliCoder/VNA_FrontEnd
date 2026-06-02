import { Edit2 } from "lucide-react";
import { Avatar } from "../Avatar";
import { cn } from "@/lib/utils";

interface AccountInfoCardProps {
  name: string;
  email: string;
  role?: string;
  avatarSrc?: string;
  onEdit?: () => void;
  className?: string;
}

export function AccountInfoCard({
  name,
  email,
  role,
  avatarSrc,
  onEdit,
  className,
}: AccountInfoCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm",
        className
      )}
    >
      <Avatar src={avatarSrc} name={name} size="xl" className="shadow-sm" />
      <div className="flex flex-1 flex-col justify-center">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {name}
          </h3>
          {onEdit && (
            <button
              onClick={onEdit}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              aria-label="Edit account info"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{email}</p>
        {role && (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {role}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
