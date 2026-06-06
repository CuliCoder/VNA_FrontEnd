"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/common/InputField";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";

// ─── Step 1: Verify OTP ───────────────────────────────────────────────────────
const otpSchema = z.object({
  otp: z.string().length(6, "Mã OTP gồm 6 chữ số"),
});

// ─── Step 2: New email ────────────────────────────────────────────────────────
const emailSchema = z.object({
  newEmail: z.string().email("Email không hợp lệ"),
  verificationToken: z.string(),
});

type OtpValues = z.infer<typeof otpSchema>;
type EmailValues = z.infer<typeof emailSchema>;
type Step = "otp" | "email" | "success";

interface Props {
  open: boolean;
  onClose: () => void;
}

const OTP_SECONDS = 60 * 5;

export function ChangeEmailModal({ open, onClose }: Props) {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState<Step>("otp");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(OTP_SECONDS);
  const [resending, setResending] = useState(false);

  // Countdown timer
  const startCountdown = () => {
    setCountdown(OTP_SECONDS);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return interval;
  };

  useEffect(() => {
    if (!open) return;

    userService.requestEmailChange().catch(() => null);
    const interval = startCountdown();

    return () => clearInterval(interval);
  }, [open]);

  const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });
  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
  });

  const handleClose = () => {
    otpForm.reset();
    emailForm.reset();
    setSubmitError(null);
    setStep("otp");
    setCountdown(OTP_SECONDS);
    onClose();
  };

  // Gửi lại OTP
  const handleResend = async () => {
    setResending(true);
    try {
      await userService.requestEmailChange();
      startCountdown();
    } catch {
      setSubmitError("Không thể gửi lại OTP. Vui lòng thử lại.");
    } finally {
      setResending(false);
    }
  };

  // Step 1: xác nhận OTP
  const onSubmitOtp = async (data: OtpValues) => {
    setSubmitError(null);
    try {
      const res = await userService.verifyEmailChangeOtp(data.otp);
      emailForm.setValue("verificationToken", res.verificationToken);
      setStep("email");
    } catch {
      setSubmitError("Mã OTP không đúng hoặc đã hết hạn.");
    }
  };

  // Step 2: lưu email mới
  const onSubmitEmail = async (data: EmailValues) => {
    setSubmitError(null);
    try {
      const user = await userService.updateEmail(data.newEmail, data.verificationToken);
      setStep("success");
      setUser(user.user);
      setTimeout(handleClose, 1500);
    } catch {
      setSubmitError("Không thể cập nhật email. Vui lòng thử lại.");
    }
  };

  const titles: Record<Step, string> = {
    otp: "Thay đổi email",
    email: "Thay đổi email",
    success: "Thay đổi email",
  };

  const renderFooter = () => {
    if (step === "success") return null;
    if (step === "otp") {
      return (
        <>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="otp-form"
            disabled={otpForm.formState.isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-60"
          >
            {otpForm.formState.isSubmitting ? "Đang xác nhận..." : "Xác nhận"}
          </button>
        </>
      );
    }
    return (
      <>
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          form="email-form"
          disabled={emailForm.formState.isSubmitting}
          className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-60"
        >
          {emailForm.formState.isSubmitting ? "Đang lưu..." : "Lưu"}
        </button>
      </>
    );
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={titles[step]}
      size="sm"
      footer={renderFooter()}
    >
      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
          ⚠ {submitError}
        </div>
      )}

      {step === "otp" && (
        <form
          id="otp-form"
          onSubmit={otpForm.handleSubmit(onSubmitOtp)}
          className="space-y-4"
        >
          <div className="text-sm text-gray-500 text-center space-y-1">
            <p>Chúng tôi đã gửi mã xác minh qua số email cũ</p>
            <p className="font-medium text-gray-700">{user?.email}</p>
            <p>Bạn vui lòng kiểm tra và điền mã xác thực.</p>
          </div>
          <InputField
            label="OTP"
            required
            maxLength={6}
            placeholder="Nhập mã 6 chữ số"
            error={otpForm.formState.errors.otp?.message}
            {...otpForm.register("otp")}
          />
          <div className="text-center space-y-1">
            {countdown > 0 && (
              <p className="text-blue-600 font-medium tabular-nums">
                {String(Math.floor(countdown / 60)).padStart(2, "0")}:
                {String(countdown % 60).padStart(2, "0")}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 text-sm">
              <p className="text-gray-400">Chưa nhận được mã?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || resending}
                className="text-blue-600 font-medium hover:underline disabled:opacity-40 disabled:no-underline"
              >
                {resending ? "Đang gửi..." : "Gửi lại"}
              </button>
            </div>
          </div>
        </form>
      )}

      {step === "email" && (
        <form
          id="email-form"
          onSubmit={emailForm.handleSubmit(onSubmitEmail)}
          className="space-y-4"
        >
          <p className="text-sm text-gray-500 text-center">
            Vui lòng nhập email mới.
          </p>
          <InputField
            label="Email"
            required
            type="email"
            placeholder="Nhập email mới"
            error={emailForm.formState.errors.newEmail?.message}
            {...emailForm.register("newEmail")}
          />
        </form>
      )}

      {step === "success" && (
        <div className="py-4 text-center text-green-600 font-medium">
          ✓ Cập nhật email thành công!
        </div>
      )}
    </Modal>
  );
}
