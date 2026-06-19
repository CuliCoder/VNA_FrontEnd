"use client";
import * as React from "react";
import { InputField } from "@/components/common/InputField";
import { MESSAGES } from "@/constants/messages";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ForgotPasswordForm({
  onSuccess,
}: {
  onSuccess: (email: string) => void;
}) {
  const [email, setEmail] = React.useState("");
  const { forgotPassword, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(MESSAGES.VALIDATION.EMAIL_INVALID);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(MESSAGES.VALIDATION.EMAIL_INVALID);
      return;
    }

    try {
      const res = await forgotPassword({ email });
      if (res == null) {
        toast.error(MESSAGES.COMMON.UNKNOWN_ERROR);
        return;
      }
      toast.success(res?.message || MESSAGES.AUTH.FORGOT_PASSWORD_SENT);
      onSuccess(email);
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? MESSAGES.COMMON.UNKNOWN_ERROR;
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm font-bold text-blue-600 tracking-wide uppercase text-center">
        Quên mật khẩu
      </p>

      <p className="text-sm text-gray-500 text-center">
        Vui lòng nhập email đã đăng ký tài khoản
      </p>

      <InputField
        label="Email"
        placeholder="Nhập email đã đăng ký tài khoản"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isLoading ? "Đang gửi..." : "Gửi xác thực"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Bạn đã có tài khoản?{" "}
        <a
          href="/login"
          className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
        >
          Đăng nhập
        </a>
      </p>
    </form>
  );
}
