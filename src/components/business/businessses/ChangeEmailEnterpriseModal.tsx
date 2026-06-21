"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/common/InputField";
import { businessService } from "@/services/businessService";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const otpSchema = z.object({
  otp: z.string().length(6, "Mã OTP gồm 6 chữ số"),
});

const emailSchema = z.object({
  newEmail: z.string().email("Email không hợp lệ"),
  verificationToken: z.string(),
});

type OtpValues = z.infer<typeof otpSchema>;
type EmailValues = z.infer<typeof emailSchema>;
type Step = "otp" | "email" | "success";

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  currentEmail: string;
  onClose: () => void;
  onSuccess: (newEmail: string) => void;
}

const OTP_SECONDS = 60;

// ─── Component ───────────────────────────────────────────────────────────────

export function ChangeEmailEnterpriseModal({
  open,
  currentEmail,
  onClose,
  onSuccess,
}: Props) {
  const [step, setStep] = useState<Step>("otp");
  const [countdown, setCountdown] = useState(OTP_SECONDS);
  const [resending, setResending] = useState(false);

  // ── Countdown ──────────────────────────────────────────────────────────────
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

  // Gửi OTP khi mở modal
  useEffect(() => {
    if (!open) return;
    businessService.requestEnterpriseEmailChange().catch(() => null);
    const interval = startCountdown();
    return () => clearInterval(interval);
  }, [open]);

  // ── Forms ─────────────────────────────────────────────────────────────────
  const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });
  const emailForm = useForm<EmailValues>({ resolver: zodResolver(emailSchema) });

  const handleClose = () => {
    otpForm.reset();
    emailForm.reset();
    setStep("otp");
    setCountdown(OTP_SECONDS);
    onClose();
  };

  // ── Gửi lại OTP ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    try {
      await businessService.requestEnterpriseEmailChange();
      startCountdown();
      toast.success("Đã gửi lại mã OTP");
    } catch {
      toast.error("Không thể gửi lại OTP. Vui lòng thử lại.");
    } finally {
      setResending(false);
    }
  };

  // ── Step 1: xác nhận OTP ──────────────────────────────────────────────────
  const onSubmitOtp = async (data: OtpValues) => {
    try {
      const res = await businessService.verifyEnterpriseEmailChangeOtp(data.otp);
      emailForm.setValue("verificationToken", res.verificationToken);
      setStep("email");
    } catch (err: any) {
      const msgs: string[] = Array.isArray(err?.message)
        ? err.message
        : [err?.message ?? "Mã OTP không đúng hoặc đã hết hạn."];
      msgs.forEach((m) => toast.error(m));
    }
  };

  // ── Step 2: nhập email mới ────────────────────────────────────────────────
  const onSubmitEmail = async (data: EmailValues) => {
    try {
      await businessService.updateEnterpriseEmail(data.newEmail, data.verificationToken);
      toast.success("Cập nhật email thành công!");
      setStep("success");
      onSuccess(data.newEmail);
      setTimeout(handleClose, 1200);
    } catch (err: any) {
      const msgs: string[] = Array.isArray(err?.message)
        ? err.message
        : [err?.message ?? "Không thể cập nhật email. Vui lòng thử lại."];
      msgs.forEach((m) => toast.error(m));
    }
  };

  // ── Footer ────────────────────────────────────────────────────────────────
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
            form="enterprise-otp-form"
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
          form="enterprise-email-form"
          disabled={emailForm.formState.isSubmitting}
          className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-60"
        >
          {emailForm.formState.isSubmitting ? "Đang lưu..." : "Lưu"}
        </button>
      </>
    );
  };

  const titles: Record<Step, string> = {
    otp: "THAY ĐỔI EMAIL",
    email: "THAY ĐỔI EMAIL",
    success: "THAY ĐỔI EMAIL",
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={titles[step]}
      size="sm"
      footer={renderFooter()}
    >
      {/* Step 1 – OTP */}
      {step === "otp" && (
        <form
          id="enterprise-otp-form"
          onSubmit={otpForm.handleSubmit(onSubmitOtp)}
          className="space-y-4"
        >
          <div className="text-sm text-gray-500 text-center space-y-1">
            <p>Chúng tôi đã gửi mã xác minh qua số email cũ</p>
            <p className="font-medium text-gray-700">{currentEmail}</p>
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

      {/* Step 2 – Email mới */}
      {step === "email" && (
        <form
          id="enterprise-email-form"
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

      {/* Step 3 – Thành công */}
      {step === "success" && (
        <div className="py-4 text-center text-green-600 font-medium">
          ✓ Cập nhật email thành công!
        </div>
      )}
    </Modal>
  );
}
