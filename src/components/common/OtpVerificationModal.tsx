"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/common/InputField";

const otpSchema = z.object({
  otp: z.string().length(6, "Mã OTP gồm 6 chữ số"),
});

type OtpValues = z.infer<typeof otpSchema>;

interface OtpVerificationModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  title?: string;
  description?: string;
}

const OTP_SECONDS = 60 * 5;

export function OtpVerificationModal({ 
  open, 
  email, 
  onClose, 
  onVerify, 
  onResend,
  title = "Xác nhận OTP",
  description = "Chúng tôi đã gửi mã xác minh qua địa chỉ email",
}: OtpVerificationModalProps) {
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
    const interval = startCountdown();
    return () => clearInterval(interval);
  }, [open]);

  const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });

  const handleClose = () => {
    otpForm.reset();
    setCountdown(OTP_SECONDS);
    onClose();
  };

  // Gửi lại OTP
  const handleResend = async () => {
    setResending(true);
    try {
      await onResend();
      startCountdown();
    } catch {
      toast.error("Không thể gửi lại OTP. Vui lòng thử lại.");
    } finally {
      setResending(false);
    }
  };

  // Xác nhận OTP
  const onSubmitOtp = async (data: OtpValues) => {
    try {
      await onVerify(data.otp);
    } catch (err: any) {
      // The onVerify function can throw an error to be handled here if needed
      // Or it might just handle toast.error inside.
    }
  };

  const renderFooter = () => {
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
          form="otp-modal-form"
          disabled={otpForm.formState.isSubmitting}
          className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-60"
        >
          {otpForm.formState.isSubmitting ? "Đang xác nhận..." : "Xác nhận"}
        </button>
      </>
    );
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={renderFooter()}
    >
      <form
        id="otp-modal-form"
        onSubmit={otpForm.handleSubmit(onSubmitOtp)}
        className="space-y-4"
      >
        <div className="text-sm text-gray-500 text-center space-y-1">
          <p>{description}</p>
          <p className="font-medium text-gray-700">{email}</p>
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
    </Modal>
  );
}
