"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, Upload, Trash2 } from "lucide-react";
import { businessService } from "@/services/businessService";

const businessSchema = z.object({
  businessName: z.string().min(1, "Tên doanh nghiệp là bắt buộc"),
  taxCode: z.string().min(1, "Mã số thuế là bắt buộc"),
  businessType: z.string().min(1, "Loại hình kinh doanh là bắt buộc"),
  mainBusinessLine: z.string().min(1, "Ngành nghề kinh doanh là bắt buộc"),
  licenseDate: z.string(),
  provinceRegistration: z.string(),
  wardRegistration: z.string(),
  addressRegistration: z.string(),
  foreignName: z.string().optional(),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  provinceOperation: z.string().optional(),
  wardOperation: z.string().optional(),
  addressOperation: z.string().optional(),
  representativeName: z.string().optional(),
  representativePhone: z.string().optional(),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

export default function BusinessForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: "Công ty cổ phần công nghệ quốc tế VNA",
      taxCode: "910000888292",
      businessType: "Công ty TNHH 1 thành viên",
      mainBusinessLine: "Bán buôn chuyên doanh khác chưa...",
      licenseDate: "2020-01-01",
      provinceRegistration: "Thành phố Hồ Chí Minh",
      wardRegistration: "Phường Hiệp Bình Phước",
      addressRegistration: "162 đường số 2, khu đô thị Vạn Phúc",
      email: "vna@gmail.com"
    }
  });

  const onSubmit = async (data: BusinessFormValues) => {
    await businessService.createBusiness(data);
    alert("Lưu thông tin thành công!");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
      {/* Stepper */}
      <div className="flex items-center justify-center max-w-xl mx-auto mb-10">
        <div className="flex items-center text-blue-600">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">1</div>
          <span className="ml-3 font-medium text-sm">Thông tin doanh nghiệp</span>
        </div>
        <div className="flex-1 h-px bg-gray-200 mx-4"></div>
        <div className="flex items-center text-gray-400">
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center font-semibold text-sm">2</div>
          <span className="ml-3 font-medium text-sm">Xác nhận đăng ký</span>
        </div>
      </div>

      <form id="business-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1 */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-800">Thêm mới doanh nghiệp</h2>
          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Tên doanh nghiệp <span className="text-red-500">*</span></label>
              <input
                {...register("businessName")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Mã số thuế <span className="text-red-500">*</span></label>
              <input
                {...register("taxCode")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Loại hình kinh doanh <span className="text-red-500">*</span></label>
              <select
                {...register("businessType")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Công ty TNHH 1 thành viên">Công ty TNHH 1 thành viên</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Ngành nghề kinh doanh chính <span className="text-red-500">*</span></label>
              <select
                {...register("mainBusinessLine")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Bán buôn chuyên doanh khác chưa...">4669 - Bán buôn chuyên doanh khác chưa...</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Ngày cấp GPKD</label>
              <input
                type="date"
                {...register("licenseDate")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Tỉnh/Thành phố ĐKKD</label>
              <select
                {...register("provinceRegistration")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Thành phố Hồ Chí Minh">Thành phố Hồ Chí Minh</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Phường/Xã ĐKKD <span className="text-red-500">*</span></label>
              <select
                {...register("wardRegistration")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Phường Hiệp Bình Phước">Phường Hiệp Bình Phước</option>
              </select>
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs text-gray-500 font-medium">Địa chỉ</label>
              <input
                {...register("addressRegistration")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 2 */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-800">Thông tin liên hệ</h2>
          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium opacity-0">Tên viết bằng tiếng nước ngoài</label>
              <input
                placeholder="Tên viết bằng tiếng nước ngoài"
                {...register("foreignName")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium opacity-0">Email</label>
              <div className="flex gap-2">
                <input
                  placeholder="Email *"
                  {...register("email")}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button type="button" className="px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-md transition">Thay đổi</button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium opacity-0">Số điện thoại cơ quan</label>
              <input
                placeholder="Số điện thoại cơ quan"
                {...register("phone")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <select
                {...register("provinceOperation")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Tỉnh/TP hoạt động KD</option>
              </select>
            </div>
            <div className="space-y-1">
              <select
                {...register("wardOperation")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Phường/xã hoạt động KD</option>
              </select>
            </div>
            <div className="space-y-1">
              <input
                placeholder="Địa điểm kinh doanh"
                {...register("addressOperation")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <input
                placeholder="Người đứng đầu doanh nghiệp"
                {...register("representativeName")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <input
                placeholder="SĐT liên hệ người đứng đầu"
                {...register("representativePhone")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3 - Files */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-800">File đính kèm</h2>
          <div className="border border-gray-100 rounded-md overflow-hidden">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-3">Tên file</th>
                  <th className="px-4 py-3">Thông tin file</th>
                  <th className="px-4 py-3 w-32 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">Giấy phép kinh doanh</td>
                  <td className="px-4 py-3">GPKD.pdf</td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button type="button" className="p-1.5 text-gray-400 hover:text-blue-600 transition"><Eye className="w-4 h-4" /></button>
                    <button type="button" className="p-1.5 text-gray-400 hover:text-blue-600 transition"><Upload className="w-4 h-4" /></button>
                    <button type="button" className="p-1.5 text-gray-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">Giấy tờ khác</td>
                  <td className="px-4 py-3">GTK1.pdf</td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button type="button" className="p-1.5 text-gray-400 hover:text-blue-600 transition"><Eye className="w-4 h-4" /></button>
                    <button type="button" className="p-1.5 text-gray-400 hover:text-blue-600 transition"><Upload className="w-4 h-4" /></button>
                    <button type="button" className="p-1.5 text-gray-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </form>
    </div>
  );
}
