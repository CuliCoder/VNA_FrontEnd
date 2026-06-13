import React, { useState } from "react";
import { X, Save } from "lucide-react";
import type { User } from "@/types/auth";

interface InitPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (userId: number, newPassword: string) => Promise<void>;
}

export default function InitPasswordModal({
  isOpen,
  onClose,
  user,
  onSubmit,
}: InitPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async () => {
    if (!password.trim()) return;
    setLoading(true);
    try {
      await onSubmit(user.id, password);
      setPassword("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#2D68FE] py-3 flex items-center justify-center relative">
          <h2 className="text-white text-lg font-semibold text-center">
            Xác nhận
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-800 mb-4 text-sm">
            Khởi tạo mật khẩu cho tài khoản{" "}
            <span className="font-bold">{user.username}</span>
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới mong muốn"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#2D68FE] hover:bg-blue-50 rounded-md transition"
          >
            Huỷ bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={!password.trim() || loading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#2D68FE] hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
