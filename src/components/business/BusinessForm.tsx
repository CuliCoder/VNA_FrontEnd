"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, Upload, Trash2 } from "lucide-react";
import { businessService, BusinessProfileRequest } from "@/services/businessService";
import { toast } from "sonner";
import { useAddress } from "@/hooks/useAddress";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const businessSchema = z.object({
  name: z.string().min(1, "Tên doanh nghiệp là bắt buộc"),
  taxCode: z.string().min(1, "Mã số thuế là bắt buộc"),
  businessTypeId: z.number().min(1, "Loại hình kinh doanh là bắt buộc"),
  businessFieldId: z.number().min(1, "Ngành nghề kinh doanh chính là bắt buộc"),
  licenseIssueDate: z.string().optional(),
  provinceId: z.number().optional(),
  wardId: z.number().optional(),
  registeredAddress: z.string().optional(),
  englishName: z.string().optional(),
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  officePhone: z.string().optional(),
  operatingProvinceId: z.number().optional(),
  operatingWardId: z.number().optional(),
  operatingAddress: z.string().optional(),
  representativeName: z.string().optional(),
  representativePhone: z.string().optional(),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

const BUSINESS_TYPES = [
  { id: 1, label: "Công ty TNHH 1 thành viên" },
  { id: 2, label: "Công ty TNHH 2 thành viên trở lên" },
  { id: 3, label: "Công ty Cổ phần" },
  { id: 4, label: "Doanh nghiệp tư nhân" },
  { id: 5, label: "Hộ kinh doanh" },
];

const BUSINESS_LINES = [
  { id: 1, code: "4669", label: "Bán buôn chuyên doanh khác chưa được phân vào đâu" },
  { id: 2, code: "6201", label: "Lập trình máy vi tính" },
  { id: 3, code: "7010", label: "Hoạt động của trụ sở văn phòng" },
];

type AttachedDoc = {
  id: string;
  documentName: string;
  documentType: string;
  fileData?: {
    url: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  };
  isUploading?: boolean;
  isDeleting?: boolean;
};

export default function BusinessForm() {
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);

  const [attachments, setAttachments] = useState<AttachedDoc[]>([
    { id: "GPKD", documentName: "Giấy phép kinh doanh", documentType: "GPKD" },
    { id: "GTK1", documentName: "Giấy tờ khác", documentType: "OTHER" },
  ]);

  const {
    provinces: provincesReg,
    wards: wardsReg,
    selectedProvince: selectedProvinceReg,
    selectedWard: selectedWardReg,
    loadingProvinces: loadingProvincesReg,
    loadingWards: loadingWardsReg,
    handleProvinceChange: handleProvinceRegChange,
    setSelectedWard: setSelectedWardReg,
  } = useAddress();

  const {
    provinces: provincesAct,
    wards: wardsAct,
    selectedProvince: selectedProvinceAct,
    selectedWard: selectedWardAct,
    loadingProvinces: loadingProvincesAct,
    loadingWards: loadingWardsAct,
    handleProvinceChange: handleProvinceActChange,
    setSelectedWard: setSelectedWardAct,
  } = useAddress();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
  });

  const onSubmit = async (data: BusinessFormValues) => {
    setIsSaving(true);
    try {
      const payload: BusinessProfileRequest = {
        name: data.name,
        taxCode: data.taxCode,
        businessTypeId: data.businessTypeId,
        businessFieldId: data.businessFieldId,
        licenseIssueDate: data.licenseIssueDate,
        provinceId: data.provinceId,
        wardId: data.wardId,
        registeredAddress: data.registeredAddress,
        englishName: data.englishName,
        email: data.email,
        officePhone: data.officePhone,
        operatingProvinceId: data.operatingProvinceId,
        operatingWardId: data.operatingWardId,
        operatingAddress: data.operatingAddress,
        representativeName: data.representativeName,
        representativePhone: data.representativePhone,
        documents: attachments
          .filter((a) => a.fileData)
          .map((a) => ({
            documentName: a.documentName,
            documentType: a.documentType,
            fileName: a.fileData!.fileName,
            filePath: a.fileData!.url,
            mimeType: a.fileData!.mimeType,
            fileSize: a.fileData!.fileSize,
          })),
      };
      await businessService.createBusiness(payload);
      toast.success("Lưu thông tin doanh nghiệp thành công!");
    } catch {
      toast.error("Không thể lưu thông tin doanh nghiệp. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass = (hasError?: boolean) =>
    `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
      hasError ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
    }`;

  const selectClass = "w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";

  const handleUploadClick = (id: string) => {
    setCurrentUploadId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadId) return;

    setAttachments((prev) =>
      prev.map((a) => (a.id === currentUploadId ? { ...a, isUploading: true } : a))
    );

    try {
      const taxCode = getValues("taxCode");
      const res = await businessService.uploadFile(file, taxCode || undefined);
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === currentUploadId
            ? { ...a, isUploading: false, fileData: res }
            : a
        )
      );
      toast.success("Tải file lên thành công!");
    } catch (error) {
      setAttachments((prev) =>
        prev.map((a) => (a.id === currentUploadId ? { ...a, isUploading: false } : a))
      );
      toast.error("Tải file lên thất bại!");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setCurrentUploadId(null);
    }
  };

  const handleDeleteClick = async (id: string) => {
    const doc = attachments.find((a) => a.id === id);
    if (!doc?.fileData) return;

    setAttachments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isDeleting: true } : a))
    );
    try {
      await businessService.deleteFile(doc.fileData.url);
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, isDeleting: false, fileData: undefined } : a
        )
      );
      toast.success("Xóa file thành công!");
    } catch (error) {
      setAttachments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isDeleting: false } : a))
      );
      toast.error("Xóa file thất bại!");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      
      <form id="business-form" onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
        {/* Section 1: Basic Business Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-800 pb-2 border-b border-gray-100">Thêm mới doanh nghiệp</h2>
          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Tên doanh nghiệp <span className="text-red-500">*</span></label>
              <input
                {...register("name")}
                placeholder="Nhập tên doanh nghiệp"
                className={fieldClass(!!errors.name)}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
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
              <div className={!!errors.businessTypeId ? "ring-1 ring-red-300 rounded-md" : ""}>
                <SearchableSelect
                  value={watch("businessTypeId") || ""}
                  placeholder="-- Chọn loại hình --"
                  options={BUSINESS_TYPES.map((t) => ({ value: t.id, label: t.label }))}
                  onChange={(val) => setValue("businessTypeId", Number(val) || 0, { shouldValidate: true })}
                />
              </div>
              {errors.businessTypeId && <p className="text-xs text-red-500">{errors.businessTypeId.message}</p>}
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-xs text-gray-500 font-medium">Ngành nghề kinh doanh chính <span className="text-red-500">*</span></label>
              <div className={!!errors.businessFieldId ? "ring-1 ring-red-300 rounded-md" : ""}>
                <SearchableSelect
                  value={watch("businessFieldId") || ""}
                  placeholder="-- Chọn ngành nghề --"
                  options={BUSINESS_LINES.map((l) => ({ value: l.id, label: `${l.code} - ${l.label}` }))}
                  onChange={(val) => setValue("businessFieldId", Number(val) || 0, { shouldValidate: true })}
                />
              </div>
              {errors.businessFieldId && <p className="text-xs text-red-500">{errors.businessFieldId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Ngày cấp GPKD</label>
              <input
                type="date"
                {...register("licenseIssueDate")}
                className={fieldClass()}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Tỉnh/Thành phố ĐKKD <span className="text-red-500">*</span></label>
              <SearchableSelect
                loading={loadingProvincesReg}
                value={selectedProvinceReg || ""}
                placeholder="-- Chọn tỉnh/thành phố --"
                options={provincesReg.map((p) => ({ value: p.code, label: p.name }))}
                onChange={(val) => {
                  const code = Number(val) || undefined;
                  handleProvinceRegChange(code ?? "");
                  setValue("provinceId", code);
                  setValue("wardId", undefined);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">Phường/Xã ĐKKD <span className="text-red-500">*</span></label>
              <SearchableSelect
                loading={loadingWardsReg}
                value={selectedWardReg || ""}
                placeholder="-- Chọn phường/xã --"
                disabled={!selectedProvinceReg}
                options={wardsReg.map((w) => ({ value: w.code, label: w.name }))}
                onChange={(val) => {
                  const code = Number(val) || undefined;
                  setSelectedWardReg(code ?? "");
                  setValue("wardId", code);
                }}
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-xs text-gray-500 font-medium">Địa chỉ</label>
              <input
                {...register("registeredAddress")}
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
                {...register("englishName")}
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
            </div>

            <div className="space-y-1.5">
              <input
                {...register("officePhone")}
                placeholder="Số điện thoại cơ quan"
                className={fieldClass()}
              />
            </div>

            <div className="space-y-1.5">
              <SearchableSelect
                loading={loadingProvincesAct}
                value={selectedProvinceAct || ""}
                placeholder="Tỉnh/TP hoạt động KD"
                options={provincesAct.map((p) => ({ value: p.code, label: p.name }))}
                onChange={(val) => {
                  const code = Number(val) || undefined;
                  handleProvinceActChange(code ?? "");
                  setValue("operatingProvinceId", code);
                  setValue("operatingWardId", undefined);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <SearchableSelect
                loading={loadingWardsAct}
                value={selectedWardAct || ""}
                placeholder="Phường/xã hoạt động KD"
                disabled={!selectedProvinceAct}
                options={wardsAct.map((w) => ({ value: w.code, label: w.name }))}
                onChange={(val) => {
                  const code = Number(val) || undefined;
                  setSelectedWardAct(code ?? "");
                  setValue("operatingWardId", code);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <input
                {...register("operatingAddress")}
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
                {attachments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">{doc.documentName}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {doc.fileData ? (
                        <a href={doc.fileData.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {doc.fileData.fileName}
                        </a>
                      ) : (
                        <span className="italic text-gray-400">Chưa có file</span>
                      )}
                      {doc.isUploading && <span className="ml-2 text-blue-500 text-xs">Đang tải lên...</span>}
                      {doc.isDeleting && <span className="ml-2 text-red-500 text-xs">Đang xóa...</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        {doc.fileData && (
                          <a
                            href={doc.fileData.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Xem"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition inline-block"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        {!doc.fileData && (
                          <button
                            type="button"
                            title="Tải lên"
                            onClick={() => handleUploadClick(doc.id)}
                            disabled={doc.isUploading}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-50"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                        {doc.fileData && (
                          <button
                            type="button"
                            title="Xóa"
                            onClick={() => handleDeleteClick(doc.id)}
                            disabled={doc.isDeleting}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </form>
    </div>
  );
}
