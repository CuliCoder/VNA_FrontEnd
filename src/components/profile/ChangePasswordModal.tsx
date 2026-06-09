"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "@/components/common/Modal";
import { PasswordInput } from "@/components/common/PasswordInput";
import { userService } from "@/services/userService";
import { toast } from "sonner";

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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

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
      toast.success("Đổi mật khẩu thành công!");
      handleClose();
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
    </Modal>
  );
}
