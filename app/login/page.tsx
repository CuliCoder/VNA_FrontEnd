"use client";
import * as React from "react";
import { InputField } from "@/components/common/InputField";
import { PasswordInput } from "@/components/common/PasswordInput";
import { MESSAGES } from "@/constants/messages";
import { useAuth } from "@/hooks/useAuth";
import AuthLayout from "@/components/auth/AuthLayout";
import { toast } from "sonner";
import { authService } from "@/services/authService"
import { useToast } from "@/hooks/use-toast";
import { Modal } from "@/components/common/Modal";
import CreateBusinessFlow from "@/components/business/businessses/CreateBusinessFlow";

export default function LoginPage() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error(MESSAGES.AUTH.LOGIN_REQUIRED_FIELDS);
      return;
    }
    try {
      const res = await authService.login({ username, password, rememberMe });
      toast.success(res.message || "Đăng nhập thành công");
      window.location.href = "/dashboard/profile";
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ?? MESSAGES.COMMON.UNKNOWN_ERROR;
      toast.error(msg);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center space-y-1">
        <h1 className="text-base font-semibold leading-snug text-gray-800">
          Phần Mềm Quản Lý - Tạo Lập Cơ Sở Dữ Liệu
        </h1>
        <p className="text-base font-semibold text-gray-800">
          An Toàn Về Sinh Lao Động
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm font-bold text-blue-600 tracking-wide uppercase">
          Đăng nhập
        </p>

        <InputField
          label="Tên tài khoản"
          placeholder="nguyenvanb.stttt"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <PasswordInput
          label="Mật khẩu"
          placeholder="••••••••••••"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-blue-600"
            />
            <span className="text-sm text-gray-600">Nhớ đăng nhập</span>
          </label>
          <a
            href="/ForgotPassword"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            Quên mật khẩu
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full h-10 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Đăng ký tài khoản doanh nghiệp
        </button>
      </form>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Đăng ký tài khoản doanh nghiệp"
        size="xl"
      >
        <div className="max-h-[80vh] overflow-y-auto px-1 py-2">
          <CreateBusinessFlow
            isPublic={true}
            onSuccess={() => setIsCreateModalOpen(false)}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </div>
      </Modal>
    </AuthLayout>
  );
}
