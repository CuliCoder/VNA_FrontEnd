import React from 'react';

export const calculatePasswordStrength = (password: string) => {
  let score = 0;
  if (!password) return score;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`@]/.test(password)) score += 1;
  return score;
};

export const getStrengthLabel = (score: number) => {
  if (score === 0) return { label: "", color: "bg-gray-200" };
  if (score <= 2) return { label: "Yếu", color: "bg-red-500" };
  if (score === 3) return { label: "Trung bình", color: "bg-yellow-500" };
  if (score === 4) return { label: "Khá", color: "bg-blue-500" };
  return { label: "Mạnh", color: "bg-green-500" };
};

interface PasswordStrengthMeterProps {
  password?: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className = "mt-2" }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const strengthScore = calculatePasswordStrength(password);
  const strengthInfo = getStrengthLabel(strengthScore);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Độ mạnh mật khẩu:</span>
        <span className={`text-xs font-medium ${strengthInfo.color.replace('bg-', 'text-')}`}>
          {strengthInfo.label}
        </span>
      </div>
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-full flex-1 rounded-full transition-all duration-300 ${
              strengthScore >= level ? strengthInfo.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
