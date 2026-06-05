"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, Upload, Trash2 } from "lucide-react";
import { businessService, BusinessProfileRequest } from "@/services/businessService";

const businessSchema = z.object({
  businessName: z.string().min(1, "Tên doanh nghiệp là bắt buộc"),
  taxCode: z.string().min(1, "Mã số thuế là bắt buộc"),
  businessType: z.string().min(1, "Loại hình kinh doanh là bắt buộc"),
  mainBusinessLine: z.string().min(1, "Ngành nghề kinh doanh là bắt buộc"),
  licenseDate: z.string().optional(),
  provinceRegistration: z.string().optional(),
  wardRegistration: z.string().optional(),
  addressRegistration: z.string().optional(),
  foreignName: z.string().optional(),
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  phone: z.string().optional(),
  provinceOperation: z.string().optional(),
  wardOperation: z.string().optional(),
  addressOperation: z.string().optional(),
  representativeName: z.string().optional(),
  representativePhone: z.string().optional(),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

const PROVINCES = [
  { value: "HCM", label: "Thành phố Hồ Chí Minh" },
  { value: "HN", label: "Hà Nội" },
  { value: "DN", label: "Đà Nẵng" },
];

const WARDS: Record<string, { value: string; label: string }[]> = {
  HCM: [
    { value: "HBP", label: "Phường Hiệp Bình Phước" },
    { value: "GV", label: "Phường Gò Vấp" },
    { value: "Q1", label: "Quận 1" },
  ],
  HN: [
    { value: "HK", label: "Hoàn Kiếm" },
    { value: "BD", label: "Ba Đình" },
  ],
};

const BUSINESS_TYPES = [
  "Công ty TNHH 1 thành viên",
  "Công ty TNHH 2 thành viên trở lên",
  "Công ty Cổ phần",
  "Doanh nghiệp tư nhân",
  "Hộ kinh doanh",
];

const BUSINESS_LINES = [
  { code: "4669", label: "Bán buôn chuyên doanh khác chưa được phân vào đâu" },
  { code: "6201", label: "Lập trình máy vi tính" },
  { code: "7010", label: "Hoạt động của trụ sở văn phòng" },
];

type AttachmentRow = { name: string; filename: string };
const ATTACHMENT_ROWS: AttachmentRow[] = [
  { name: "Giấy phép kinh doanh", filename: "GPKD.pdf" },
  { name: "Giấy tờ khác", filename: "GTK1.pdf" },
];

export default function BusinessForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("HCM");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      provinceRegistration: "HCM",
    },
  });

  const onSubmit = async (data: BusinessFormValues) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const payload: BusinessProfileRequest = {
        businessName: data.businessName,
        taxCode: data.taxCode,
        businessType: data.businessType,
        mainBusinessLine: data.mainBusinessLine,
        licenseDate: data.licenseDate || "",
        provinceRegistration: data.provinceRegistration || "",
        wardRegistration: data.wardRegistration || "",
        addressRegistration: data.addressRegistration || "",
        foreignName: data.foreignName,
        email: data.email,
        phone: data.phone,
        provinceOperation: data.provinceOperation,
        wardOperation: data.wardOperation,
        addressOperation: data.addressOperation,
        representativeName: data.representativeName,
        representativePhone: data.representativePhone,
      };
      await businessService.createBusiness(payload);
      setSaveSuccess(true);
    } catch {
      setSaveError("Không thể lưu thông tin doanh nghiệp. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass = (hasError?: boolean) =>
    `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
      hasError ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
    }`;

  const selectClass = "w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      

      <form id="business-form" onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
        {/* Feedback */}
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-lg">
            ✓ Lưu thông tin doanh nghiệp thành công!
          </div>
        )}
        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg flex justify-between">
            <span>⚠ {saveError}</span>
            <button type="button" onClick={() => setSaveError(null)}>✕</button>
          </div>
        )}

        {/* Section 1: Basic Business Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-800 pb-2 border-b border-gray-100">Thêm mới doanh nghiệp</h2>
          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Tên doanh nghiệp <span className="text-red-500">*</span></label>
              <input
                {...register("businessName")}
                placeholder="Nhập tên doanh nghiệp"
                className={fieldClass(!!errors.businessName)}
              />
              {errors.businessName && <p className="text-xs text-red-500">{errors.businessName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Mã số thuế <span className="text-red-500">*</span></label>
              <input
                {...register("taxCode")}
                placeholder="Nhập mã số thuế"
                className={fieldClass(!!errors.taxCode)}
              />
              {errors.taxCode && <p className="text-xs text-red-500">{errors.taxCode.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Loại hình kinh doanh <span className="text-red-500">*</span></label>
              <select {...register("businessType")} className={selectClass}>
                <option value="">-- Chọn loại hình --</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.businessType && <p className="text-xs text-red-500">{errors.businessType.message}</p>}
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-xs text-gray-500 font-medium">Ngành nghề kinh doanh chính <span className="text-red-500">*</span></label>
              <select {...register("mainBusinessLine")} className={selectClass}>
                <option value="">-- Chọn ngành nghề --</option>
                {BUSINESS_LINES.map((l) => (
                  <option key={l.code} value={l.code}>{l.code} - {l.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Ngày cấp GPKD</label>
              <input
                type="date"
                {...register("licenseDate")}
                className={fieldClass()}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Tỉnh/Thành phố ĐKKD <span className="text-red-500">*</span></label>
              <select
                {...register("provinceRegistration")}
                className={selectClass}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <option value="">-- Chọn tỉnh/thành phố --</option>
                {PROVINCES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Phường/Xã ĐKKD <span className="text-red-500">*</span></label>
              <select {...register("wardRegistration")} className={selectClass}>
                <option value="">-- Chọn phường/xã --</option>
                {(WARDS[selectedProvince] || []).map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-xs text-gray-500 font-medium">Địa chỉ</label>
              <input
                {...register("addressRegistration")}
                placeholder="Nhập địa chỉ trụ sở"
                className={fieldClass()}
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 2: Contact Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-800 pb-2 border-b border-gray-100">Thông tin liên hệ</h2>
          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <input
                {...register("foreignName")}
                placeholder="Tên viết bằng tiếng nước ngoài"
                className={fieldClass()}
              />
            </div>

            <div className="space-y-1.5 flex gap-2">
              <div className="flex-1">
                <input
                  {...register("email")}
                  placeholder="Email *"
                  className={fieldClass(!!errors.email)}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <button type="button" className="shrink-0 px-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-md border border-blue-200 transition h-fit">
                Thay đổi
              </button>
            </div>

            <div className="space-y-1.5">
              <input
                {...register("phone")}
                placeholder="Số điện thoại cơ quan"
                className={fieldClass()}
              />
            </div>

            <div className="space-y-1.5">
              <select {...register("provinceOperation")} className={selectClass}>
                <option value="">Tỉnh/TP hoạt động KD</option>
                {PROVINCES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <select {...register("wardOperation")} className={selectClass}>
                <option value="">Phường/xã hoạt động KD</option>
                {(WARDS[selectedProvince] || []).map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <input
                {...register("addressOperation")}
                placeholder="Địa điểm kinh doanh"
                className={fieldClass()}
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <input
                {...register("representativeName")}
                placeholder="Người đứng đầu doanh nghiệp"
                className={fieldClass()}
              />
            </div>

            <div className="space-y-1.5">
              <input
                {...register("representativePhone")}
                placeholder="SĐT liên hệ người đứng đầu"
                className={fieldClass()}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Attachments (UI only, no upload logic) */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-800 pb-2 border-b border-gray-100">File đính kèm</h2>
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Tên file</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Thông tin file</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ATTACHMENT_ROWS.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-gray-500">{row.filename}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          title="Xem"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Tải lên"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Xóa"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
}
