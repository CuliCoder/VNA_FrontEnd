"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { PasswordInput } from "@/components/common/PasswordInput";
import { userService } from "@/services/userService";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmNewPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu mới"),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmNewPassword"],
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleClose = () => {
    reset();
    setSubmitError(null);
    setSuccess(false);
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    try {
      await userService.changePassword(
        data.currentPassword,
        data.newPassword,
        data.confirmNewPassword
      );
      setSuccess(true);
      setTimeout(handleClose, 1500);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setSubmitError(msg ?? "Đổi mật khẩu thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Đổi mật khẩu"
      size="sm"
      footer={
        success ? null : (
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
              form="change-password-form"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-60"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        )
      }
    >
      {success ? (
        <div className="py-4 text-center text-green-600 font-medium">
          ✓ Đổi mật khẩu thành công!
        </div>
      ) : (
        <form
          id="change-password-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
              ⚠ {submitError}
            </div>
          )}
          <PasswordInput
            placeholder="Nhập mật khẩu cũ"
            label="Mật khẩu cũ"
            required
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
          <PasswordInput
            placeholder="Nhập mật khẩu mới"
            label="Mật khẩu mới"
            required
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <PasswordInput
            placeholder="Nhập lại mật khẩu mới"
            label="Nhập lại mật khẩu mới"
            required
            error={errors.confirmNewPassword?.message}
            {...register("confirmNewPassword")}
          />
        </form>
      )}
    </Modal>
  );
}
