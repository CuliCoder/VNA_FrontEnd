"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { useAddress } from "@/hooks/useAddress";
import { changeEmailEvents } from "@/hooks/useModal";
import { UpdateProfileRequest } from "@/types/user";
import { toast } from "sonner";
const accountSchema = z.object({
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  birthDate: z.string().optional().refine((val) => !val || /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/.test(val), {
    message: "Định dạng ngày không hợp lệ (DD/MM/YYYY)",
  }),
  gender: z.string().optional(),
  position: z.string().optional(),
  provinceId: z.number().optional(),
  wardId: z.number().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormProps {
  onSaveSuccess?: () => void;
}

export default memo(function AccountForm({ onSaveSuccess }: AccountFormProps) {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const {
    provinces,
    wards,
    selectedProvince,
    selectedWard,
    loadingProvinces,
    loadingWards,
    handleProvinceChange,
    setSelectedWard,
    setSelectedProvince,
  } = useAddress(user?.provinceId ?? undefined, user?.wardId ?? undefined);
  useEffect(() => {
    if (user?.provinceId) {
      setSelectedProvince(user.provinceId);
    }
    if (user?.wardId) {
      setSelectedWard(user.wardId);
    }
  }, [user, setSelectedProvince, setSelectedWard]);
  const {
    register,
    setValue,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
  });

  const avatarUrl = useWatch({ control, name: "avatarUrl" });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName ?? "",
        birthDate: user.birthDate ? (() => {
          const [year, month, day] = user.birthDate.split("T")[0].split("-");
          return `${day}/${month}/${year}`;
        })() : "",
        gender: user.gender ?? "",
        position: user.position ?? "",
        provinceId: user.provinceId ?? undefined,
        wardId: user.wardId ?? undefined,
        address: user.address ?? "",
        avatarUrl: user.avatarUrl ?? undefined,
        phone: user.phone ?? undefined,
        isActive: user.isActive,
      } as AccountFormValues);
    }
  }, [user, reset]);

  const onSubmit = async (data: AccountFormValues) => {
    try {
      let apiBirthDate = null;
      if (data.birthDate) {
        const [day, month, year] = data.birthDate.split("/");
        if (day && month && year) {
          apiBirthDate = `${year}-${month}-${day}`;
        }
      }

      const payload: UpdateProfileRequest = {
        fullName: data.fullName,
        birthDate: apiBirthDate || null!,
        gender: data.gender || null!,
        position: data.position || null!,
        provinceId: data.provinceId,
        wardId: data.wardId,
        address: data.address || null!,
        avatarUrl: data.avatarUrl || user?.avatarUrl || null,
      };
      const updated = await userService.updateProfile(payload);
      setUser(updated);
      toast.success("Cập nhật thông tin thành công!");
      onSaveSuccess?.();
    } catch {
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại.");
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file *.jpeg, *.jpg, *.png");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa 5 MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await userService.uploadAvatar(formData);
      setValue("avatarUrl", res, { shouldDirty: true });
      setUser({ ...user, avatarUrl: res });
    } catch {
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingAvatar(false);
      // Reset input để có thể chọn lại cùng file
      e.target.value = "";
    }
  };
  return (
    <form
      id="account-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex gap-6 items-start"
    >
      {/* Left Column */}
      <div className="w-64 shrink-0 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-4">
        <div className="relative group">
          {/* Input file ẩn */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpeg,.jpg,.png"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            onClick={handleAvatarClick}
            className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition overflow-hidden relative"
          >
            {isUploadingAvatar ? (
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            ) : avatarUrl ? (
              <>
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
                {/* Overlay khi hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">Đổi ảnh</span>
                </div>
              </>
            ) : (
              <>
                <Camera className="w-7 h-7 mb-1" />
                <span className="text-[11px] text-center px-2">
                  Tải ảnh đại diện
                </span>
              </>
            )}
          </div>
        </div>
        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          *.jpeg, *.jpg, *.png.
          <br />
          Kích thước tối đa 5 MB
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
                className={`w-11 h-6 rounded-full transition-all duration-200 relative outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${value ? "bg-blue-600" : "bg-gray-200"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow absolute top-1 transition-transform duration-200 ${value ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            )}
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 space-y-5">
        {/* Personal Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">
            Thông tin cá nhân
          </h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            {/* Username (readonly) */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Tên đăng nhập(*)
              </label>
              <input
                disabled
                value={user.username}
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-blue-600 text-sm cursor-not-allowed"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Họ và tên(*)
              </label>
              <input
                {...register("fullName")}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.fullName
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                  }`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Ngày tháng năm sinh
              </label>
              <Controller
                control={control}
                name="birthDate"
                render={({ field: { onChange, value } }) => (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={value || ""}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length > 8) val = val.slice(0, 8);
                        if (val.length > 4) {
                          val = val.slice(0, 2) + "/" + val.slice(2, 4) + "/" + val.slice(4);
                        } else if (val.length > 2) {
                          val = val.slice(0, 2) + "/" + val.slice(2);
                        }
                        onChange(val);
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10 ${errors.birthDate ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <input
                        type="date"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        value={(() => {
                          if (!value) return "";
                          const parts = value.split("/");
                          if (parts.length === 3 && parts[2].length === 4) {
                            return `${parts[2]}-${parts[1]}-${parts[0]}`;
                          }
                          return "";
                        })()}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [y, m, d] = e.target.value.split("-");
                            onChange(`${d}/${m}/${y}`);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              />
              {errors.birthDate && (
                <p className="text-xs text-red-500">{errors.birthDate.message}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Giới tính
              </label>
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
              <label className="text-xs text-gray-500 font-medium">
                Chức danh
              </label>
              <input
                {...register("position")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Role (readonly) */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Vai trò *
              </label>
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
                  onClick={changeEmailEvents.open}
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
          <h2 className="text-sm font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">
            Thông tin liên hệ
          </h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            {/* Province */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Tỉnh/ thành phố
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                value={selectedProvince}
                onChange={(e) => {
                  const code = Number(e.target.value) || undefined;
                  handleProvinceChange(code ?? "");
                  setValue("provinceId", code);
                  setValue("wardId", undefined);
                }}
              >
                <option value="">
                  {loadingProvinces
                    ? "Đang tải..."
                    : `-- Chọn tỉnh/ thành phố --`}
                </option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Ward */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Phường/ xã
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                value={selectedWard}
                onChange={(e) => {
                  const code = Number(e.target.value) || undefined;
                  setSelectedWard(code ?? "");
                  setValue("wardId", code);
                }}
              >
                <option value="">
                  {loadingWards ? "Đang tải..." : `-- Chọn phường/xã --`}
                </option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs text-gray-500 font-medium">
                Địa chỉ
              </label>
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
});
