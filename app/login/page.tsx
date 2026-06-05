"use client";
import * as React from "react";
import { InputField } from "@/components/common/InputField";
import { PasswordInput } from "@/components/common/PasswordInput";
import { Alert } from "@/components/common/Alert";
import { MESSAGES } from "@/constants/messages";
import { useAuth } from "@/hooks/useAuth";
import AuthLayout from "@/components/auth/AuthLayout";
export default function LoginPage() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState<string | null>(null);

  const { login, isLoading, error, clearErrors } = useAuth();

  const displayAlert = alertMsg ?? error;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlertMsg(null);

    if (!username.trim() || !password.trim()) {
      setAlertMsg(MESSAGES.AUTH.LOGIN_REQUIRED_FIELDS);
      return;
    }
    await login({ username, password, rememberMe });
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
          onChange={(e) => {
            setUsername(e.target.value);
            setAlertMsg(null);
          }}
        />

        <PasswordInput
          label="Mật khẩu"
          placeholder="••••••••••••"
          id="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setAlertMsg(null);
          }}
        />

        {/* Remember me + Forgot password */}
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
            href="/ForgotPasswordPage"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            Quên mật khẩu
          </a>
        </div>

        {/* Alert — hiện khi có lỗi */}
        {displayAlert && (
          <Alert
            variant="error"
            title={displayAlert}
            onClose={() => {
              setAlertMsg(null);
              clearErrors();
            }}
          />
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <button
          type="button"
          className="w-full h-10 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Đăng ký tài khoản doanh nghiệp
        </button>
      </form>
    </AuthLayout>
  );
}
