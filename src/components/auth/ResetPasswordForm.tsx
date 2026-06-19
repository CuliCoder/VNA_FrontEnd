"use client";
import * as React from "react";
import { InputField } from "@/components/common/InputField";
import { PasswordInput } from "@/components/common/PasswordInput";
import { MESSAGES } from "@/constants/messages";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ResetPasswordForm({ email }: { email: string }) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const { resetPassword, forgotPassword, isLoading } = useAuth();
  // --- Countdown ---
  const OTP_SECONDS = 5 * 60;
  const [countdown, setCountdown] = React.useState(OTP_SECONDS);
  const [canResend, setCanResend] = React.useState(false);

  React.useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!canResend) return;
    await forgotPassword({ email });
    setCountdown(OTP_SECONDS);
    setCanResend(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPassword.trim() || !confirmNewPassword.trim() || !otp.trim()) {
      toast.error(MESSAGES.AUTH.RESET_PASSWORD_REQUIRED_FIELDS);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error(MESSAGES.AUTH.RESET_PASSWORD_NOT_MATCH);
      return;
    }

    try {
      const res = await resetPassword({
        email,
        otp,
        newPassword,
        confirmNewPassword,
      });
      if (res == null) {
        toast.error(MESSAGES.COMMON.UNKNOWN_ERROR);
        return;
      }
      toast.success(res?.message || MESSAGES.AUTH.RESET_PASSWORD_SUCCESS);
      window.location.href = "/login";
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

      <div className="text-center text-sm text-gray-500 space-y-1">
        <p>Chúng tôi đã gửi mã xác minh qua số email</p>
        <p className="font-semibold text-gray-700">{email}</p>
        <p>Bạn vui lòng kiểm tra và điền mã xác thực</p>
      </div>

      <PasswordInput
        label="Nhập mật khẩu mới"
        placeholder="Nhập mật khẩu mới"
        id="newPassword"
        value={newPassword}
        required
        onChange={(e) => {
          setNewPassword(e.target.value);
        }}
      />

      <PasswordInput
        label="Xác nhận mật khẩu mới"
        placeholder="Xác nhận mật khẩu mới"
        id="confirmNewPassword"
        value={confirmNewPassword}
        required
        onChange={(e) => {
          setConfirmNewPassword(e.target.value);
        }}
      />

      <InputField
        label="OTP"
        placeholder="Nhập mã OTP"
        id="otp"
        value={otp}
        required
        onChange={(e) => {
          setOtp(e.target.value);
        }}
      />

      <div className="text-center space-y-1">
        {!canResend && (
          <p className="text-blue-600 font-semibold text-sm">
            {formatTime(countdown)}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Chưa nhận được mã?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={`font-medium transition-colors ${
              canResend
                ? "text-blue-600 hover:underline cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            Gửi lại
          </button>
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isLoading ? "Đang xử lý..." : "Khôi phục mật khẩu"}
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
