"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { userService, UpdateProfileRequest } from "@/services/userService";

const accountSchema = z.object({
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  position: z.string().optional(),
  provinceId: z.number().optional(),
  wardId: z.number().optional(),
  address: z.string().optional(),
  isActive: z.boolean(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormProps {
  onSaveSuccess?: () => void;
}

export default function AccountForm({ onSaveSuccess }: AccountFormProps) {
  const { user, setUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName ?? "",
        birthDate: user.birthDate?.split("T")[0] ?? "",
        gender: user.gender ?? "",
        position: user.position ?? "",
        provinceId: user.provinceId ?? undefined,
        wardId: user.wardId ?? undefined,
        address: user.address ?? "",
        isActive: user.isActive ?? true,
      } as AccountFormValues);
    }
  }, [user, reset]);

  const onSubmit = async (data: AccountFormValues) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const payload: UpdateProfileRequest = {
        fullName: data.fullName,
        birthDate: data.birthDate || undefined,
        gender: data.gender || undefined,
        position: data.position || undefined,
        provinceId: data.provinceId,
        wardId: data.wardId,
        address: data.address || undefined,
        isActive: data.isActive,
      };
      const updated = await userService.updateProfile(payload);
      setUser(updated);
      setSaveSuccess(true);
      onSaveSuccess?.();
    } catch {
      setSaveError("Không thể cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
        Đang tải thông tin...
      </div>
    );
  }

  return (
    <form id="account-form" onSubmit={handleSubmit(onSubmit)} className="flex gap-6 items-start">
      {/* Left Column */}
      <div className="w-64 shrink-0 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-4">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="w-7 h-7 mb-1" />
                <span className="text-[11px] text-center px-2">Tải ảnh đại diện</span>
              </>
            )}
          </div>
        </div>
        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          *.jpeg, *.jpg, *.png.<br />Kích thước tối đa 5 MB
        </p>

        <div className="flex items-center justify-between w-full pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">Kích hoạt</span>
          <Controller
            control={control}
            name="isActive"
            render={({ field: { onChange, value } }) => (
              <button
                type="button"
                onClick={() => onChange(!value)}
                className={`w-11 h-6 rounded-full transition-all duration-200 relative outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                  value ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow absolute top-1 transition-transform duration-200 ${
                    value ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            )}
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 space-y-5">
        {/* Save feedback */}
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-lg">
            ✓ Cập nhật thông tin thành công!
          </div>
        )}
        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg flex justify-between">
            <span>⚠ {saveError}</span>
            <button type="button" onClick={() => setSaveError(null)} className="ml-2 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Personal Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">Thông tin cá nhân</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            {/* Username (readonly) */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Tên đăng nhập(*)</label>
              <input
                disabled
                value={user.username}
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-blue-600 text-sm cursor-not-allowed"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Họ và tên(*)</label>
              <input
                {...register("fullName")}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.fullName ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Ngày tháng năm sinh</label>
              <input
                type="date"
                {...register("birthDate")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Giới tính</label>
              <select
                {...register("gender")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            {/* Position */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Chức danh</label>
              <input
                {...register("position")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Role (readonly) */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Vai trò *</label>
              <input
                disabled
                value={user.role?.name || ""}
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs text-gray-500 font-medium">Email</label>
              <div className="flex gap-2">
                <input
                  disabled
                  value={user.email}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                />
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-md transition border border-blue-200"
                >
                  Thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">Thông tin liên hệ</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            {/* Province */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Tỉnh/ thành phố</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                defaultValue={user.provinceId ?? ""}
                onChange={(e) => {
                  // provinceId is a number
                }}
              >
                <option value="">-- Chọn tỉnh/thành phố --</option>
                <option value={1}>Thành phố Hồ Chí Minh</option>
                <option value={2}>Hà Nội</option>
                <option value={3}>Đà Nẵng</option>
              </select>
            </div>

            {/* Ward */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Phường/ xã</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                defaultValue={user.wardId ?? ""}
              >
                <option value="">-- Chọn phường/xã --</option>
                <option value={1}>Phường Gò Vấp</option>
                <option value={2}>Quận 1</option>
                <option value={3}>Quận 3</option>
              </select>
            </div>

            {/* Address */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs text-gray-500 font-medium">Địa chỉ</label>
              <input
                {...register("address")}
                placeholder="Nhập địa chỉ cụ thể"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
