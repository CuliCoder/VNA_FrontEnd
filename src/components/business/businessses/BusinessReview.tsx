"use client";

import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { saveBusinessDraft } from "@/lib/sessionForm";
import { locationService } from "@/services/locationService";
import { businessTypeService } from "@/services/businessTypeService";
import { businessFieldService } from "@/services/businessFieldService";

export interface ReviewData {
  name: string;
  taxCode: string;

  licenseNumber?: string;
  licenseDate?: string;

  businessTypeId?: number;
  businessTypeName?: string;

  businessFieldId?: number;
  businessFieldName?: string;

  provinceId?: number;
  provinceRegistrationName?: string;

  wardRegistration?: number;
  wardRegistrationName?: string;

  addressRegistration?: string;

  provinceOperation?: number;
  provinceIdActivity?: number;
  provinceOperationName?: string;

  wardId?: number;
  wardOperation?: number;
  wardIdActivity?: number;
  wardOperationName?: string;

  addressOperation?: string;
  operatingAddress?: string;

  foreignName?: string;

  email: string;
  phone?: string;
  officePhone?: string;

  representativeName?: string;
  representativePhone?: string;

  files?: {
    documentName?: string;
    documentType?: string;
    fileName?: string;
    filePath?: string;
    url?: string;
    file?: File;
  }[];
}

interface BusinessReviewProps {
  data: ReviewData;
  onBack: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex py-2 border-b border-gray-50 last:border-0">
      <span className="w-64 flex-shrink-0 text-sm text-gray-500">
        {label} :
      </span>

      <span className="flex-1 text-sm font-medium text-gray-800">
        {value || "—"}
      </span>
    </div>
  );
}

export default function BusinessReview({
  data,
  onBack,
  onConfirm,
  isLoading,
  mode = "create",
}: BusinessReviewProps) {
  const [businessTypeName, setBusinessTypeName] = useState<string>("");
  const [businessFieldName, setBusinessFieldName] = useState<string>("");
  const [provinceName, setProvinceName] = useState<string>("");
  const [wardName, setWardName] = useState<string>("");
  const [opProvinceName, setOpProvinceName] = useState<string>("");
  const [opWardName, setOpWardName] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        if (data.businessTypeId) {
          const types = await businessTypeService.getBusinessTypes();
          const t = types.find((x) => Number(x.id) === Number(data.businessTypeId));
          if (t) setBusinessTypeName(t.name);
        }

        if (data.businessFieldId) {
          const fields = await businessFieldService.getBusinessFields();
          const f = fields.find((x) => Number(x.id) === Number(data.businessFieldId));
          if (f) setBusinessFieldName(f.name);
        }

        if (data.provinceId) {
          const provinces = await locationService.getProvinces();
          const p = provinces.find((x) => Number(x.code) === Number(data.provinceId));
          if (p) {
            setProvinceName(p.name);
            const wards = await locationService.getWardsByProvince(Number(p.code));
            const w = wards.find((x) => Number(x.code) === Number(data.wardRegistration || data.wardId));
            if (w) setWardName(w.name);
          }
        }
        // operation / activity province/ward may be named differently in different data shapes
        const opProvinceId = data.provinceIdActivity ?? data.provinceOperation;
        const opWardId = data.wardIdActivity ?? data.wardOperation;
        if (opProvinceId) {
          const provinces = await locationService.getProvinces();
          const p = provinces.find((x) => Number(x.code) === Number(opProvinceId));
          if (p) {
            setOpProvinceName(p.name);
            const wards = await locationService.getWardsByProvince(Number(p.code));
            const w = wards.find((x) => Number(x.code) === Number(opWardId));
            if (w) setOpWardName(w.name);
          }
        }
      } catch (err) {
        console.error("Error loading review lookup data:", err);
      }
    };

    load();
  }, [data]);
  const handleBack = async () => {
    try {
      await saveBusinessDraft("business-draft", data);
    } catch (err) {
      console.error("Error saving draft:", err);
    }

    onBack();
  };
  const regAddress = [
    data.addressRegistration,
    wardName || (data.wardRegistrationName
      ? `${data.wardRegistrationName} ${data.wardRegistration ? `(${data.wardRegistration})` : ""}`
      : data.wardRegistration
      ? String(data.wardRegistration)
      : undefined),
    provinceName || (data.provinceRegistrationName
      ? `${data.provinceRegistrationName} ${data.provinceId ? `(${data.provinceId})` : ""}`
      : data.provinceId
      ? String(data.provinceId)
      : undefined),
  ]
    .filter(Boolean)
    .join(", ");

  const opAddress = [
    data.operatingAddress || data.addressOperation,
    opWardName || (data.wardOperationName
      ? `${data.wardOperationName} ${data.wardIdActivity ?? data.wardOperation ? `(${data.wardIdActivity ?? data.wardOperation})` : ""}`
      : (data.wardIdActivity ?? data.wardOperation)
      ? String(data.wardIdActivity ?? data.wardOperation)
      : undefined),
    opProvinceName || (data.provinceOperationName
      ? `${data.provinceOperationName} ${data.provinceOperation ? `(${data.provinceOperation})` : ""}`
      : data.provinceOperation
      ? String(data.provinceOperation)
      : undefined),
  ]
    .filter(Boolean)
    .join(", ");


  const formatDate = (value?: string) => {
    if (!value) return "";

    return new Date(value).toLocaleDateString("vi-VN");
  };
  return (
    <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-800">
          Thông tin về hồ sơ
        </h2>
      </div>

      {/* Information */}
      <div className="px-8 py-4">
        <InfoRow label="Mã số thuế" value={data.taxCode} />

        <InfoRow label="Tên doanh nghiệp" value={data.name} />

        <InfoRow
          label="Tên viết bằng tiếng nước ngoài"
          value={data.foreignName}
        />

        <InfoRow
          label="Số giấy phép kinh doanh"
          value={data.licenseNumber}
        />

        <InfoRow
          label="Ngày cấp GPKD"
          value={formatDate(data.licenseDate)}
        />

        <InfoRow label="Email" value={data.email} />

        <InfoRow
          label="Số điện thoại cơ quan"
          value={data.phone || data.officePhone}
        />

        <InfoRow
          label="Loại hình kinh doanh"
          value={
            (data.businessTypeId || businessTypeName)
              ? `${data.businessTypeId ?? ""}${businessTypeName ? ` - ${businessTypeName}` : ""}`
              : "—"
          }
        />

        <InfoRow
          label="Ngành nghề kinh doanh"
          value={
            (data.businessFieldId || businessFieldName)
              ? `${data.businessFieldId ?? ""}${businessFieldName ? ` - ${businessFieldName}` : ""}`
              : "—"
          }
        />

        <InfoRow
          label="Địa chỉ đăng ký GPKD"
          value={regAddress}
        />

        <InfoRow
          label="Địa điểm kinh doanh"
          value={opAddress}
        />

        <InfoRow
          label="Người đứng đầu doanh nghiệp"
          value={data.representativeName}
        />

        <InfoRow
          label="SĐT người đứng đầu"
          value={data.representativePhone}
        />
      </div>

      {/* Files */}
      <div className="px-8 py-4">
        <div className="overflow-hidden border border-gray-100 rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">
                  Tên file
                </th>

                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">
                  Thông tin file
                </th>

                <th className="w-20 px-4 py-2.5 text-xs font-semibold text-center text-gray-500">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {data.files && data.files.length > 0 ? (
                data.files.map((f, idx) => (
                  <tr
                    key={
                      f.fileName ||
                      f.file?.name ||
                      idx
                    }
                  >
                    <td className="px-4 py-2.5 text-gray-700">
                      {f.documentName || "Tài liệu"}
                    </td>

                    <td className="px-4 py-2.5 text-gray-500">
                      {f.fileName || f.file?.name}
                    </td>

                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        className="p-1 transition rounded text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          if (f.file) {
                            window.open(
                              URL.createObjectURL(f.file),
                              "_blank"
                            );
                          } else if (
                            f.url ||
                            f.filePath
                          ) {
                            window.open(
                              f.url || f.filePath,
                              "_blank"
                            );
                          }
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-4 text-sm italic text-center text-gray-500"
                  >
                    Chưa có file nào được đính kèm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleBack}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-600 transition border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-60"
        >
          Trở về
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white transition bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {isLoading && (
            <svg
              className="w-4 h-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                className="opacity-75"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          )}

          {mode === "edit"
            ? "Cập nhật"
            : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}