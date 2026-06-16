"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, Upload, Trash2 } from "lucide-react";
import { locationService, Province, Ward } from "@/services/locationService";
import { businessTypeService, BusinessType } from "@/services/businessTypeService";
import { businessFieldService, BusinessField } from "@/services/businessFieldService";
import {
  EnterpriseDocumentPayload,
  type BusinessProfileRequest,
  businessService,
  Enterprise,
} from "@/services/businessService";

import { mapFormToBusinessRequest, mapFormToReviewData } from "./mapper";
// ─── Types ─────────────────────────────────────────────

export interface ReviewData {
  name: string;
  taxCode: string;

  licenseNumber?: string;
  licenseDate?: string;

  businessTypeId?: number;
  businessFieldId?: number;

  provinceId?: number;
  wardId?: number;
  addressRegistration?: string;

  provinceIdActivity?: number;
  wardIdActivity?: number;
  operatingAddress?: string;

  foreignName?: string;

  email: string;
  officePhone?: string;

  representativeName?: string;
  representativePhone?: string;

  documents?: any[];
}

// ─── Schema ─────────────────────────────────────────────

const businessSchema = z.object({
  name: z.string().min(1),
  taxCode: z.string().regex(/^\d{10}$/),

  licenseNumber: z.string().optional(),
  licenseDate: z.string().optional(),

  businessType: z.string().min(1),
  mainBusinessLine: z.string().min(1),

  provinceRegistration: z.string().min(1),
  wardRegistration: z.string().min(1),

  addressRegistration: z.string().optional(),

  foreignName: z.string().optional(),

  email: z.string().email(),
  phone: z.string().optional(),

  provinceOperation: z.string().optional(),
  wardOperation: z.string().optional(),

  addressOperation: z.string().optional(),

  representativeName: z.string().optional(),
  representativePhone: z.string().optional(),

  files: z.any().optional(),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;

// ─── Props ─────────────────────────────────────────────

interface BusinessFormProps {
  mode?: "create" | "edit" | "step";

  // Accept either UI form partials or enterprise partials from API
  initialData?: any; // accept either form partials or enterprise partials

  onNext?: (data: ReviewData) => void;

  onSubmitDirect?: (data: BusinessProfileRequest) => Promise<void>;

  onCancel?: () => void;
  formId?: string;
}

interface FixedFileItem {
  id: string;
  type: string;        // UI label
  name: string;        // file name

  documentType?: string;
  file?: File;
  url?: string;
}

// ─── Component ─────────────────────────────────────────

export default function BusinessForm({
  mode = "step",
  initialData,
  onNext,
  onSubmitDirect,
  onCancel,
  formId = "business-form",
}: BusinessFormProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [opWards, setOpWards] = useState<Ward[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [businessFields, setBusinessFields] = useState<BusinessField[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);


  const [fixedFiles, setFixedFiles] = useState<FixedFileItem[]>([
    { id: "gpkd", type: "Giấy phép kinh doanh", name: "" },
    { id: "other", type: "Giấy tờ khác", name: "" },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const handleUploadClick = (id: string) => {
    setActiveFileId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeFileId) return;

    setFixedFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId
          ? { ...f, file, name: file.name, url: URL.createObjectURL(file) }
          : f
      )
    );

    setActiveFileId(null);
    e.currentTarget.value = "";
  };

  const previewFile = (item: FixedFileItem) => {
    if (item.url) {
      window.open(item.url, "_blank");
      return;
    }
    if (item.file) {
      const u = URL.createObjectURL(item.file);
      window.open(u, "_blank");
    }
  };

  const removeFile = (id: string) => {
    setFixedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, file: undefined, url: undefined, name: "" } : f))
    );
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      taxCode: "",
      licenseNumber: "",
      licenseDate: "",

      businessType: "",
      mainBusinessLine: "",

      provinceRegistration: "",
      wardRegistration: "",

      addressRegistration: "",

      foreignName: "",
      email: "",
      phone: "",

      provinceOperation: "",
      wardOperation: "",
      addressOperation: "",

      representativeName: "",
      representativePhone: "",
    },
  });

  const selectedProvince = watch("provinceRegistration");
  const selectedOpProvince = watch("provinceOperation");

  // ─── LOAD INITIAL DATA ─────────────────────────────
  useEffect(() => {
    if (!initialData) return;

    reset({
      name: initialData.name || "",
      taxCode: initialData.taxCode || "",

      licenseNumber: initialData.licenseNumber || "",
      // accept both `licenseIssueDate` (API shape) and `licenseDate` (internal draft)
      licenseDate: (initialData.licenseIssueDate || initialData.licenseDate)
        ? new Date(initialData.licenseIssueDate || initialData.licenseDate).toISOString().split("T")[0]
        : "",

      businessType: String(initialData.businessTypeId || ""),
      mainBusinessLine: String(initialData.businessFieldId || ""),

      provinceRegistration: String(initialData.provinceId || ""),
      wardRegistration: String(initialData.wardId || ""),

      addressRegistration: initialData.registeredAddress || "",

      provinceOperation: String(initialData.provinceIdActivity || ""),
      wardOperation: String(initialData.wardIdActivity || ""),
      addressOperation: initialData.operatingAddress || "",

      // accept both `englishName` and `foreignName` variants
      foreignName: initialData.englishName || initialData.foreignName || "",
      email: initialData.email || "",
      phone: initialData.officePhone || "",

      representativeName: initialData.representativeName || "",
      representativePhone: initialData.representativePhone || "",
    });

    // Restore attached files/documents if provided in initialData
    const docs = (initialData.documents || initialData.files) as any[] | undefined;
    if (Array.isArray(docs)) {
      try {
        const gpkd = docs.find(d => d.documentType === "BUSINESS_LICENSE" || (d.documentName && /gpkd|giấy phép|giấy phép kinh doanh/i.test(d.documentName)));
        const other = docs.find(d => d.documentType !== "BUSINESS_LICENSE");

        setFixedFiles([
          {
            id: "gpkd",
            type: "Giấy phép kinh doanh",
            name: gpkd?.fileName || "",
            file: gpkd?.file,
            url: gpkd?.filePath || gpkd?.url,
          },
          {
            id: "other",
            type: "Giấy tờ khác",
            name: other?.fileName || "",
            file: other?.file,
            url: other?.filePath || other?.url,
          },
        ]);
      } catch (err) {
        console.error("Error restoring files from initialData:", err);
      }
    }
  }, [initialData, reset]);

  // ─── FETCH DATA ─────────────────────────────────────
  useEffect(() => {
    locationService.getProvinces().then(setProvinces);
    businessTypeService.getBusinessTypes().then(setBusinessTypes);
    businessFieldService.getBusinessFields().then(setBusinessFields);
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      locationService
        .getWardsByProvince(Number(selectedProvince))
        .then(setWards);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedOpProvince) {
      locationService
        .getWardsByProvince(Number(selectedOpProvince))
        .then(setOpWards);
    }
  }, [selectedOpProvince]);

  // ─── SUBMIT ─────────────────────────────────────────
  const onSubmit = async (data: BusinessFormValues) => {
    try {
      setIsSaving(true);

      // STEP MODE
      if (mode === "step" && onNext) {
        const docs = fixedFiles.map((f) => ({
          documentName: f.type,
          documentType: f.id === "gpkd" ? "BUSINESS_LICENSE" : "OTHER",
          fileName: f.file?.name,
          filePath: f.url,
          mimeType: f.file?.type,
          fileSize: f.file?.size,
          // include the File object so Review can preview it
          file: f.file,
          url: f.url,
        }));

        const stepPayload = mapFormToReviewData(data, docs);

        onNext(stepPayload);
        return;
      }

      // FILE UPLOAD
      const filesToUpload = fixedFiles.filter((f) => f.file);

      const uploaded = filesToUpload.length
        ? await businessService.uploadFiles(filesToUpload.map((f) => f.file!), data.taxCode)
        : [];

      const documents: EnterpriseDocumentPayload[] = uploaded.map((doc, i) => ({
        documentName: filesToUpload[i]?.type || doc.documentName,
        documentType: doc.documentType,
        fileName: doc.fileName,
        filePath: doc.filePath,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
      }));

      const payload = mapFormToBusinessRequest(data, documents);

      if (mode === "create") await onSubmitDirect?.(payload);
      if (mode === "edit") await onSubmitDirect?.(payload);

    } catch (err) {
      console.error(err);
      setSaveError("Có lỗi xảy ra khi lưu dữ liệu");
    } finally {
      setIsSaving(false);
    }
  };
  const fc = (hasError?: boolean) =>
    `w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 transition ${hasError ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
    }`;
  const sc =
    "w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg flex justify-between">
            <span>⚠ {saveError}</span>
            <button type="button" onClick={() => setSaveError(null)}>✕</button>
          </div>
        )}

        {/* ── Section 1: Thông tin cơ bản ── */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-800 pb-2 border-b border-gray-100">
            Thông tin doanh nghiệp
          </h2>
          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-1.5 relative">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-gray-500 font-medium z-10">Tên doanh nghiệp <span className="text-red-500">*</span></div>
              <input  {...register("name", {
                required: "Tên doanh nghiệp là bắt buộc",
              })} placeholder="Tên doanh nghiệp" className={fc(!!errors.name)} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5 relative">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-gray-500 font-medium z-10">Mã số thuế <span className="text-red-500">*</span></div>
              <input
                {...register("taxCode", {
                  required: "Mã số thuế là số bắt buộc có 10 chữ số",
                })}
                placeholder="Mã số thuế"
                disabled={mode === "edit"}
                className={fc(!!errors.taxCode, mode === "edit" && "bg-gray-100 cursor-not-allowed")}
              />
              {errors.taxCode && <p className="text-xs text-red-500">{errors.taxCode.message}</p>}
            </div>
            <div className="space-y-1.5 relative">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-gray-500 font-medium z-10">Loại hình kinh doanh <span className="text-red-500">*</span></div>
              <select {...register("businessType", {
                required: "Loại hình kinh doanh là bắt buộc",
              })} className={fc(!!errors.businessType)}>
                <option value="">Loại hình kinh doanh</option>
                {businessTypes.map(t => <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>)}
              </select>
              {errors.businessType && <p className="text-xs text-red-500">{errors.businessType.message}</p>}
            </div>
            <div className="space-y-1.5 relative">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-gray-500 font-medium z-10">Ngành nghề kinh doanh chính <span className="text-red-500">*</span></div>
              <select {...register("mainBusinessLine", {
                required: "Ngành nghề kinh doanh chính là bắt buộc",
              })} className={fc(!!errors.mainBusinessLine)}>
                <option value="">Ngành nghề kinh doanh chính</option>
                {businessFields.map(l => <option key={l.id} value={String(l.id)}>
                  {l.code} - {l.name}
                </option>)}
              </select>
              {errors.mainBusinessLine && <p className="text-xs text-red-500">{errors.mainBusinessLine.message}</p>}
            </div>
            <div className="space-y-1.5 relative">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-gray-500 font-medium z-10">Ngày cấp GPKD</div>
              <input type="date" {...register("licenseDate")} title="Ngày cấp GPKD" className={fc(!!errors.licenseDate)} />
              {errors.licenseDate && <p className="text-xs text-red-500">{errors.licenseDate.message}</p>}
            </div>
            <div className="space-y-1.5 relative">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-gray-500 font-medium z-10">Tỉnh/Thành phố ĐKKD <span className="text-red-500">*</span></div>
              <select {...register("provinceRegistration")} className={fc(!!errors.provinceRegistration)}>
                <option value="">Tỉnh/Thành phố ĐKKD</option>
                {provinces.map(p => <option key={p.code} value={String(p.code)}>{p.name}</option>)}
              </select>
              {errors.provinceRegistration && <p className="text-xs text-red-500">{errors.provinceRegistration.message}</p>}
            </div>
            <div className="space-y-1.5 relative">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-gray-500 font-medium z-10">Phường/Xã ĐKKD <span className="text-red-500">*</span></div>
              <select {...register("wardRegistration")} className={fc(!!errors.wardRegistration)} disabled={!selectedProvince}>
                <option value="">Phường/Xã ĐKKD</option>
                {wards.map(w => <option key={w.code} value={String(w.code)}>{w.name}</option>)}
              </select>
              {errors.wardRegistration && <p className="text-xs text-red-500">{errors.wardRegistration.message}</p>}
            </div>
            <div className="space-y-1.5 relative">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-gray-500 font-medium z-10">Địa chỉ</div>
              <input {...register("addressRegistration")} placeholder="Địa chỉ đăng ký ĐKKD" className={fc(!!errors.addressRegistration)} />
              {errors.addressRegistration && <p className="text-xs text-red-500">{errors.addressRegistration.message}</p>}
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* ── Section 2: Thông tin liên hệ ── */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-800 pb-2 border-b border-gray-100">Thông tin liên hệ</h2>
          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <input {...register("foreignName")} placeholder="Tên viết bằng tiếng nước ngoài" className={fc()} />
            </div>
            <div className="space-y-1.5 relative">
              <div className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-gray-500 font-medium z-10">Email <span className="text-red-500">*</span></div>
              <input {...register("email", {
                required: "Email là bắt buộc",
              })} placeholder="Email *" className={fc(!!errors.email) + " pt-3"} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <input {...register("phone", {
                required: "Số điện thoại là bắt buộc",
              })} placeholder="Số điện thoại cơ quan" className={fc(!!errors.phone)} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <select {...register("provinceOperation")} className={sc}>
                <option value="">Tỉnh/TP hoạt động KD</option>
                {provinces.map(p => <option key={p.code} value={String(p.code)}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <select {...register("wardOperation")} className={sc} disabled={!selectedOpProvince}>
                <option value="">Phường/xã hoạt động KD</option>
                {opWards.map(w => <option key={w.code} value={String(w.code)}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"></div> {/* Empty space to match layout if needed, actually layout puts Address next to Ward */}
            <div className="space-y-1.5">
              <input {...register("addressOperation", {
                required: "Địa điểm kinh doanh là bắt buộc",
              })} placeholder="Địa điểm kinh doanh" className={fc(!!errors.addressOperation)} />
            </div>
            <div className="space-y-1.5">
              <input {...register("representativeName", {
                required: "Người đứng đầu doanh nghiệp là bắt buộc",
              })} placeholder="Người đứng đầu doanh nghiệp" className={fc(!!errors.representativeName)} />
            </div>
            <div className="space-y-1.5">
              <input {...register("representativePhone", {
                required: "SĐT liên hệ người đứng đầu là bắt buộc",
              })} placeholder="SĐT liên hệ người đứng đầu" className={fc(!!errors.representativePhone)} />
              {errors.representativePhone && <p className="text-xs text-red-500">{errors.representativePhone.message}</p>}
            </div>
          </div>
        </div>

        {/* ── Section 3: File đính kèm ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">File đính kèm</h2>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf"
            />
          </div>

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
                {fixedFiles.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium truncate max-w-50">{item.type}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.name ? item.name : <span className="italic text-gray-400">chưa tải lên file</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button type="button" disabled={!item.file && !item.url} onClick={() => previewFile(item)} title="Xem" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-30">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleUploadClick(item.id)} title="Tải lên" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                          <Upload className="w-4 h-4" />
                        </button>
                        <button type="button" disabled={!item.file && !item.url} onClick={() => removeFile(item.id)} title="Xóa" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-30">
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

        {(mode === "step" ||
          mode === "create" ||
          mode === "edit") && (
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                >
                  Huỷ bỏ
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm flex items-center gap-1.5 disabled:opacity-60"
              >
                {mode === "edit"
                  ? "Cập nhật"
                  : mode === "create"
                    ? "Tạo mới"
                    : "Tiếp tục"}
              </button>
            </div>
          )}
      </form>
    </div>
  );
}
