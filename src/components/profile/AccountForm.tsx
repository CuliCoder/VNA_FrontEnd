"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera } from "lucide-react";
import { userService, UserProfile } from "@/services/userService";

// Simplified UI components mocking for now, replace with actual shadcn imports if available
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";

const accountSchema = z.object({
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  dob: z.string().optional(),
  gender: z.string().optional(),
  jobTitle: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email("Email không hợp lệ"),
  province: z.string().optional(),
  ward: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export default function AccountForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
  });

  useEffect(() => {
    userService.getProfile().then((data) => {
      setProfile(data);
      reset({
        fullName: data.fullName,
        dob: data.dob,
        gender: data.gender,
        jobTitle: data.jobTitle,
        role: data.role,
        email: data.email,
        province: data.province,
        ward: data.ward,
        address: data.address,
        isActive: data.isActive,
      });
      setLoading(false);
    });
  }, [reset]);

  const onSubmit = async (data: AccountFormValues) => {
    await userService.updateProfile(data);
    alert("Cập nhật thông tin thành công!");
  };

  if (loading || !profile) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

  return (
    <form id="account-form" onSubmit={handleSubmit(onSubmit)} className="flex gap-6 items-start">
      {/* Left Column - Avatar & Status */}
      <div className="w-1/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50 mb-4 cursor-pointer hover:bg-gray-100 transition">
          <Camera className="w-8 h-8 mb-2" />
          <span className="text-xs">Tải ảnh đại diện</span>
        </div>
        <p className="text-xs text-gray-500 mb-8 text-center">
          *.jpeg, *.jpg, *.png.<br />Kích thước tối đa 5 MB
        </p>

        <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">Kích hoạt</span>
          {/* Simple toggle mock */}
          <Controller
            control={control}
            name="isActive"
            render={({ field: { onChange, value } }) => (
              <button
                type="button"
                onClick={() => onChange(!value)}
                className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${value ? 'left-6' : 'left-1'}`} />
              </button>
            )}
          />
        </div>
      </div>

      {/* Right Column - Info Forms */}
      <div className="w-2/3 space-y-6">
        {/* Personal Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">Thông tin cá nhân</h2>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Tên đăng nhập(*)</label>
              <input
                disabled
                value={profile.username}
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 text-sm focus:outline-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Họ và tên(*)</label>
              <input
                {...register("fullName")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Ngày tháng năm sinh</label>
              <input
                type="date"
                {...register("dob")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Giới tính</label>
              <select
                {...register("gender")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Chức danh</label>
              <input
                {...register("jobTitle")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Vai trò *</label>
              <select
                {...register("role")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="admin">Quản trị viên</option>
                <option value="business">Doanh nghiệp</option>
                <option value="user">Người dùng</option>
              </select>
            </div>
            
            <div className="space-y-1 col-span-2">
              <label className="text-xs text-gray-500 font-medium">Email</label>
              <div className="flex gap-2">
                <input
                  disabled
                  value={profile.email}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 text-sm focus:outline-none"
                />
                <button type="button" className="px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-md transition">
                  Thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">Thông tin liên hệ</h2>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Tỉnh/ thành phố</label>
              <select
                {...register("province")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="HCM">Thành phố Hồ Chí Minh</option>
                <option value="HN">Hà Nội</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Phường/ xã</label>
              <select
                {...register("ward")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="GV">Phường Gò Vấp</option>
                <option value="Q1">Quận 1</option>
              </select>
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-xs text-gray-500 font-medium">Địa chỉ</label>
              <input
                {...register("address")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
