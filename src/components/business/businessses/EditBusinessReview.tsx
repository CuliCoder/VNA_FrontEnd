"use client";

import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { saveBusinessDraft } from "@/lib/sessionForm";
import { locationService } from "@/services/locationService";
import { businessTypeService } from "@/services/businessTypeService";
import { businessFieldService } from "@/services/businessFieldService";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BusinessDocument {
    documentName: string;
    documentType: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    fileSize: number;
}

export interface EditReviewData {
    name: string;
    licenseNumber: string;
    licenseIssueDate?: string;

    businessTypeId: number;
    businessFieldId: number;

    provinceId?: number;
    wardId?: number;
    registeredAddress?: string;

    operatingProvinceId?: number;
    operatingWardId?: number;
    operatingAddress?: string;

    englishName?: string;

    email: string;
    officePhone?: string;

    representativeName?: string;
    representativePhone?: string;

    documents?: BusinessDocument[];
}

interface EditBusinessReviewProps {
  data: EditReviewData;
  onBack: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function InfoRow({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="flex py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500 w-64 shrink-0">{label} :</span>
            <span className="text-sm text-gray-800 font-medium flex-1">
                {value || "—"}
            </span>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────

export default function EditBusinessReview({
    data,
    onBack,
    onConfirm,
    isLoading,
}: EditBusinessReviewProps) {
    const handleBack = async () => {
        try {
            await saveBusinessDraft("business-draft", data);
        } catch (err) {
            console.error("Error saving draft:", err);
        }

        onBack();
    };
    const [businessTypeName, setBusinessTypeName] = useState<string>("");
    const [businessFieldName, setBusinessFieldName] = useState<string>("");
    const [provinceName, setProvinceName] = useState<string>("");
    const [wardName, setWardName] = useState<string>("");
    const [opProvinceName, setOpProvinceName] = useState<string>("");
    const [opWardName, setOpWardName] = useState<string>("");

    // Load lookup data
    useEffect(() => {
        const loadData = async () => {
            try {
                if (data.businessTypeId) {
                    const types = await businessTypeService.getBusinessTypes();
                    const type = types.find(
                        (t) => Number(t.id) === Number(data.businessTypeId)
                    );

                    if (type) setBusinessTypeName(type.name);
                }

                if (data.businessFieldId) {
                    const fields = await businessFieldService.getBusinessFields();
                    const field = fields.find(
                        (f) => Number(f.id) === Number(data.businessFieldId)
                    );

                    if (field) setBusinessFieldName(field.name);
                }

                if (data.provinceId) {
                    const provinces = await locationService.getProvinces();

                    const province = provinces.find(
                        (p) => Number(p.code) === Number(data.provinceId)
                    );

                    if (province) {
                        setProvinceName(province.name);

                        const wards = await locationService.getWardsByProvince(
                            Number(province.code)
                        );

                        const ward = wards.find(
                            (w) => Number(w.code) === Number(data.wardId)
                        );

                        if (ward) setWardName(ward.name);
                    }
                }

                if (data.operatingProvinceId) {
                    const provinces = await locationService.getProvinces();

                    const province = provinces.find(
                        (p) => Number(p.code) === Number(data.operatingProvinceId)
                    );

                    if (province) {
                        setOpProvinceName(province.name);

                        const wards = await locationService.getWardsByProvince(
                            Number(province.code)
                        );

                        const ward = wards.find(
                            (w) => Number(w.code) === Number(data.operatingWardId)
                        );

                        if (ward) setOpWardName(ward.name);
                    }
                }
            } catch (err) {
                console.error("Error loading lookup data:", err);
            }
        };

        loadData();
    }, [data]);

    const regAddress = [
        data.registeredAddress,
        wardName,
        provinceName,
    ]
        .filter(Boolean)
        .join(", ");

    const opAddress = [
        data.operatingAddress,
        opWardName,
        opProvinceName,
    ]
        .filter(Boolean)
        .join(", ");
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* ── Header section ── */}
            <div className="px-8 py-5 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Xác nhận cập nhật thông tin doanh nghiệp</h2>
            </div>

            {/* ── Info rows ── */}
            <div className="px-8 py-4 space-y-0">
                <InfoRow label="Số giấy phép" value={data.licenseNumber} />
                <InfoRow label="Tên doanh nghiệp" value={data.name} />
                <InfoRow
                    label="Tên viết bằng tiếng nước ngoài"
                    value={data.englishName}
                />
                <InfoRow
                    label="Ngày cấp GPKD"
                    value={data.licenseIssueDate}
                />
                <InfoRow label="Email" value={data.email} />
                <InfoRow label="Số điện thoại" value={data.officePhone} />
                <InfoRow label="Loại hình kinh doanh" value={businessTypeName} />
                <InfoRow label="Ngành nghề kinh doanh" value={businessFieldName} />
                <InfoRow
                    label="Địa chỉ đăng ký GPKD"
                    value={regAddress || "—"}
                />
                <InfoRow
                    label="Địa điểm kinh doanh"
                    value={opAddress || "—"}
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

            {/* ── File đính kèm ── */}
            <div className="px-8 py-4">
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">
                                    Tên file
                                </th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">
                                    Thông tin file
                                </th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center w-20">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.documents && data.documents.length > 0 ? (
                                data.documents.map((f, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2.5 text-gray-700">
                                            {f.documentName}
                                        </td>

                                        <td className="px-4 py-2.5 text-gray-500">
                                            {f.fileName}
                                        </td>

                                        <td className="px-4 py-2.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (f.filePath) {
                                                        window.open(f.filePath, "_blank");
                                                    }
                                                }}
                                                className="text-blue-500 hover:text-blue-700 transition p-1 rounded hover:bg-blue-50"
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
                                        className="px-4 py-4 text-center text-gray-500 italic text-sm"
                                    >
                                        Chưa có file nào được đính kèm.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Footer actions ── */}
            <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition disabled:opacity-60"
                >
                    Trở về
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                >
                    {isLoading ? (
                        <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            />
                        </svg>
                    ) : null}
                    Xác nhận
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
