"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "@/components/common/Modal";
import { PasswordInput } from "@/components/common/PasswordInput";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { PasswordStrengthMeter } from "@/components/common/PasswordStrengthMeter";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`@]).+$/,
        "Mật khẩu mới phải bao gồm ít nhất 1 chữ viết hoa, 1 chữ viết thường, 1 chữ số và 1 ký tự đặc biệt"
      ),
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
  const { logout } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const newPasswordValue = watch("newPassword", "");

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await userService.changePassword(
        data.currentPassword,
        data.newPassword,
        data.confirmNewPassword
      );
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      handleClose();
      await logout();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      toast.error(msg ?? "Đổi mật khẩu thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Đổi mật khẩu"
      size="sm"
      footer={
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
      }
    >
      <form
        id="change-password-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <PasswordInput
          placeholder="Nhập mật khẩu cũ"
          label="Mật khẩu cũ"
          required
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <div>
          <PasswordInput
            placeholder="Nhập mật khẩu mới"
            label="Mật khẩu mới"
            required
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <PasswordStrengthMeter password={newPasswordValue} />
        </div>
        <PasswordInput
          placeholder="Nhập lại mật khẩu mới"
          label="Nhập lại mật khẩu mới"
          required
          error={errors.confirmNewPassword?.message}
          {...register("confirmNewPassword")}
        />
      </form>
    </Modal>
  );
}
