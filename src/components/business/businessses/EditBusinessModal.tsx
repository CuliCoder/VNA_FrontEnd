"use client";

import React, { useEffect } from "react";
import BusinessForm from "./BusinessForm";
import { businessService, Enterprise } from "@/services/businessService";

interface Props {
  open: boolean;
  enterprise: Enterprise | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditBusinessModal({
  open,
  enterprise,
  onClose,
  onSuccess,
}: Props) {
  const handleSubmit = async (payload: any) => {
    if (!enterprise?.id) return;

    // taxCode is immutable/identifier — do not send it in update payload
    const { taxCode, ...updatePayload } = payload;
    await businessService.updateEnterprise(enterprise.id, updatePayload);

    onClose();
    onSuccess();
  };

  // ESC to close
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className="
          relative z-[10000]
          w-[95vw] max-w-5xl
          bg-white rounded-xl shadow-xl
          max-h-[90vh] overflow-auto
        "
      >
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Cập nhật doanh nghiệp</h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        {enterprise && (
          <div className="p-4">
            <BusinessForm
              mode="edit"
              initialData={enterprise}
              onSubmitDirect={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}