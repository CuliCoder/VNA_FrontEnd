"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Calendar, Eye, EyeOff } from "lucide-react";
import { adminUserService } from "@/services/adminUserService";
import { useAddress } from "@/hooks/useAddress";
import type { User, Role } from "@/types/auth";
import type { CreateUserRequest, UpdateUserRequest } from "@/types/adminUser";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

// ─── Schema ──────────────────────────────────────────────────────────────────
// Schema duy nhất cho cả create/edit — tất cả optional ở base,
// superRefine sẽ bổ sung validation bắt buộc theo mode.
const baseSchema = z.object({
  username: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional(),
  password: z.string().optional(),
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  roleId: z.number().optional(),
  birthDate: z.string().optional().refine((val) => !val || /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/.test(val), {
    message: "Định dạng ngày không hợp lệ (DD/MM/YYYY)",
  }),
  gender: z.string().optional(),
  position: z.string().optional(),
  provinceId: z.number().optional(),
  wardId: z.number().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
  avatarUrl: z.string().optional(),
});

/** Schema dùng cho tạo mới: bổ sung validation bắt buộc */
const createSchema = baseSchema.superRefine((data, ctx) => {
  if (!data.username || data.username.length < 3) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["username"], message: "Tên đăng nhập tối thiểu 3 ký tự" });
  }
  if (!data.email) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Email là bắt buộc" });
  }
  if (!data.password || data.password.length < 8) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["password"], message: "Mật khẩu tối thiểu 8 ký tự" });
  }
  if (!data.roleId || data.roleId < 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["roleId"], message: "Vai trò là bắt buộc" });
  }
});

/** Schema dùng cho chỉnh sửa: chỉ validate email nếu có nhập */
const editSchema = baseSchema;

type FormValues = z.infer<typeof baseSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────
interface UserFormProps {
  /** undefined = create mode, number = edit mode */
  userId?: number;
  /** If true, fields are read-only (view mode) */
  readOnly?: boolean;
  onSaveSuccess?: (user: User) => void;
}

export default memo(function UserForm({
  userId,
  readOnly = false,
  onSaveSuccess,
}: UserFormProps) {
  const isEdit = userId !== undefined;
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingUser, setLoadingUser] = useState(isEdit);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

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
  } = useAddress(
    targetUser?.provinceId ?? undefined,
    targetUser?.wardId ?? undefined,
  );

  const schema = isEdit ? editSchema : createSchema;

  const {
    register,
    setValue,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { 
      isActive: true,
      password: isEdit ? undefined : "12345678"
    },
  });

  const avatarUrl = useWatch({ control, name: "avatarUrl" });

  // Load roles
  useEffect(() => {
    adminUserService
      .getRoles()
      .then(setRoles)
      .catch(() => toast.error("Không thể tải danh sách vai trò"));
  }, []);

  // Load user detail (edit mode)
  useEffect(() => {
    if (!isEdit) return;
    setLoadingUser(true);
    adminUserService
      .getUserById(userId!)
      .then((u) => {
        setTargetUser(u);
        reset({
          fullName: u.fullName ?? "",
          email: u.email ?? "",
          roleId: u.roleId,
          birthDate: u.birthDate ? (() => {
            const [year, month, day] = u.birthDate.split("T")[0].split("-");
            return `${day}/${month}/${year}`;
          })() : "",
          gender: u.gender ?? "",
          position: u.position ?? "",
          provinceId: u.provinceId ?? undefined,
          wardId: u.wardId ?? undefined,
          address: u.address ?? "",
          isActive: u.isActive,
          avatarUrl: u.avatarUrl ?? undefined,
        });
        if (u.provinceId) setSelectedProvince(u.provinceId);
        if (u.wardId) setSelectedWard(u.wardId);
      })
      .catch((ex: any) => toast.error(ex.message))
      .finally(() => setLoadingUser(false));
  }, [isEdit, userId, reset, setSelectedProvince, setSelectedWard]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormValues) => {
    try {
      let apiBirthDate = null;
      if (data.birthDate) {
        const [day, month, year] = data.birthDate.split("/");
        if (day && month && year) {
          apiBirthDate = `${day}/${month}/${year}`;
        }
      }

      let savedUser: User;
      if (isEdit) {
        const payload: UpdateUserRequest = {
          fullName: data.fullName,
          email: data.email,
          roleId: data.roleId,
          birthDate: apiBirthDate,
          gender: data.gender || null,
          position: data.position || null,
          provinceId: data.provinceId ?? null,
          wardId: data.wardId ?? null,
          address: data.address || null,
          isActive: data.isActive,
          avatarUrl: data.avatarUrl || null,
        };
        savedUser = await adminUserService.updateUser(userId!, payload);
        toast.success("Cập nhật thông tin thành công!");
      } else {
        const payload: CreateUserRequest = {
          username: data.username!,
          email: data.email!,
          password: data.password!,
          fullName: data.fullName,
          roleId: data.roleId!,
          birthDate: apiBirthDate,
          gender: data.gender || null,
          position: data.position || null,
          provinceId: data.provinceId ?? null,
          wardId: data.wardId ?? null,
          address: data.address || null,
          isActive: data.isActive ?? true,
          avatarUrl: data.avatarUrl || null,
        };
        savedUser = await adminUserService.createUser(payload);
        toast.success("Tạo người dùng thành công!");
      }
      onSaveSuccess?.(savedUser);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ── Avatar upload ────────────────────────────────────────────────────────────
  const handleAvatarClick = () => {
    if (!readOnly) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      const url = await adminUserService.uploadAvatar(formData);
      setValue("avatarUrl", url, { shouldDirty: true });
      toast.success("Tải ảnh thành công!");
    } catch {
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loadingUser) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
        Đang tải thông tin...
      </div>
    );
  }

  return (
    <form
      id="user-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex gap-6 items-start"
    >
      {/* ── Left Column: Avatar + Toggle ─── */}
      <div className="w-64 shrink-0 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative group">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpeg,.jpg,.png"
            className="hidden"
            onChange={handleFileChange}
          />
          <div
            onClick={handleAvatarClick}
            className={`w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50 overflow-hidden relative transition ${readOnly ? "cursor-default" : "cursor-pointer hover:bg-gray-100"
              }`}
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
                {!readOnly && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">Đổi ảnh</span>
                  </div>
                )}
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

        {/* Kích hoạt toggle */}
        <div className="flex items-center justify-between w-full pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">Kích hoạt</span>
          <Controller
            control={control}
            name="isActive"
            render={({ field: { onChange, value } }) => (
              <button
                type="button"
                disabled={readOnly}
                onClick={() => !readOnly && onChange(!value)}
                className={`w-11 h-6 rounded-full transition-all duration-200 relative outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${value ? "bg-blue-600" : "bg-gray-200"
                  } ${readOnly ? "cursor-default opacity-70" : ""}`}
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

      {/* ── Right Column: Form sections ── */}
      <div className="flex-1 space-y-5">
        {/* Thông tin cá nhân */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">
            Thông tin cá nhân
          </h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Tên đăng nhập{!isEdit && " *"}
              </label>
              <input
                {...register("username")}
                disabled={isEdit || readOnly}
                placeholder={isEdit ? targetUser?.username : "Nhập tên đăng nhập"}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${isEdit
                    ? "bg-gray-50 text-blue-600 cursor-not-allowed border-gray-200"
                    : errors.username
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
              />
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Mật khẩu (chỉ hiển thị khi tạo mới) */}
            {!isEdit && (
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    disabled={readOnly}
                    placeholder="Nhập mật khẩu"
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10 ${errors.password ? "border-red-300 bg-red-50" : "border-gray-200"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* Họ và tên */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Họ và tên *
              </label>
              <input
                {...register("fullName")}
                disabled={readOnly}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.fullName
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                  } ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Ngày sinh */}
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
                      disabled={readOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10 ${errors.birthDate ? "border-red-300 bg-red-50" : "border-gray-200"
                        } ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    />
                    {!readOnly && (
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
                    )}
                  </div>
                )}
              />
              {errors.birthDate && (
                <p className="text-xs text-red-500">{errors.birthDate.message}</p>
              )}
            </div>

            {/* Giới tính */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Giới tính
              </label>
              <select
                {...register("gender")}
                disabled={readOnly}
                className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            {/* Chức danh */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Chức danh
              </label>
              <input
                {...register("position")}
                disabled={readOnly}
                className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
              />
            </div>

            {/* Vai trò */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Vai trò *
              </label>
              <Controller
                control={control}
                name="roleId"
                render={({ field }) => (
                  <select
                    value={field.value ?? ""}
                    disabled={readOnly}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || undefined)
                    }
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${errors.roleId
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                      } ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="">-- Chọn vai trò --</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.roleId && (
                <p className="text-xs text-red-500">{errors.roleId.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Email *
              </label>
              <input
                type="email"
                {...register("email")}
                disabled={readOnly}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200"
                  } ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin liên hệ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">
            Thông tin liên hệ
          </h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            {/* Tỉnh/Thành phố */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Tỉnh/ thành phố
              </label>
              <SearchableSelect
                disabled={readOnly}
                loading={loadingProvinces}
                value={selectedProvince}
                placeholder="-- Chọn tỉnh/ thành phố --"
                options={provinces.map((p) => ({ value: p.code, label: p.name }))}
                onChange={(code) => {
                  const val = code === "" ? undefined : (code as number);
                  handleProvinceChange(code as number | "");
                  setValue("provinceId", val);
                  setValue("wardId", undefined);
                }}
              />
            </div>

            {/* Phường/Xã */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">
                Phường/ xã
              </label>
              <SearchableSelect
                disabled={readOnly || !selectedProvince}
                loading={loadingWards}
                value={selectedWard}
                placeholder="-- Chọn phường/xã --"
                options={wards.map((w) => ({ value: w.code, label: w.name }))}
                onChange={(code) => {
                  const val = code === "" ? undefined : (code as number);
                  setSelectedWard(code as number | "");
                  setValue("wardId", val);
                }}
              />
            </div>

            {/* Địa chỉ */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs text-gray-500 font-medium">
                Địa chỉ
              </label>
              <input
                {...register("address")}
                autoComplete="street-address"
                disabled={readOnly}
                placeholder="Nhập địa chỉ cụ thể"
                className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
});
