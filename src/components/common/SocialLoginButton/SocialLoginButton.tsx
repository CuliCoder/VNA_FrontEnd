import React from 'react';
import { SiGoogle, SiFacebook, SiGithub } from "react-icons/si";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: "google" | "facebook" | "github";
  loading?: boolean;
}

export function SocialLoginButton({
  provider,
  loading,
  className,
  disabled,
  ...props
}: SocialLoginButtonProps) {
  const providers = {
    google: {
      icon: SiGoogle,
      label: "Google",
      color: "text-red-500",
    },
    facebook: {
      icon: SiFacebook,
      label: "Facebook",
      color: "text-blue-600",
    },
    github: {
      icon: SiGithub,
      label: "GitHub",
      color: "text-neutral-800 dark:text-neutral-200",
    },
  };

  const { icon: Icon, label, color } = providers[provider];

  return (
    <button
      type="button"
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className={cn("h-4 w-4", color)} />
      )}
      <span>Continue with {label}</span>
    </button>
  );
}
