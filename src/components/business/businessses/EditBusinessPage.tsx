"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { businessService, Enterprise } from "@/services/businessService";
import BusinessForm from "./BusinessForm";
import { ChangeEmailEnterpriseModal } from "./ChangeEmailEnterpriseModal";
import EditBusinessReview from "./EditBusinessReview";
import { loadBusinessDraft, clearBusinessDraft } from "@/lib/sessionForm";

interface Props {
  enterpriseId: number;
}

export default function EditBusinessPage({ enterpriseId }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [step, setStep] = useState(1);
  const [reviewPayload, setReviewPayload] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftInitial, setDraftInitial] = useState<any>(null);

  // Role detection
  const roleCode = user?.role?.code ?? "";
  const isAdmin = roleCode === "ADMIN" || roleCode === "MANAGER" || roleCode === "INSPECTOR";
  const isEnterprise = roleCode === "ENTERPRISE";

  // Clear draft on mount
  useEffect(() => {
    try {
      clearBusinessDraft("business-draft");
    } catch (e) {}
  }, []);

  // ── Fetch enterprise ────────────────────────────────────────────────────────
  const fetchEnterprise = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await businessService.getEnterpriseById(enterpriseId);
      setEnterprise(data);
    } catch (err: any) {
      toast.error("Không thể tải thông tin doanh nghiệp");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [enterpriseId]);

  useEffect(() => {
    fetchEnterprise();
  }, [fetchEnterprise]);

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = async (payload: any) => {
    if (!enterprise?.id) return;
    if (isAdmin) {
      // Admin: show review page first
      setReviewPayload(payload);
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Enterprise: update immediately
      try {
        const { taxCode, ...updatePayload } = payload;
        await businessService.updateEnterprise(enterprise.id, updatePayload);
        toast.success("Cập nhật doanh nghiệp thành công");
        await fetchEnterprise();
        toast.info("Thông tin đã được làm mới");
      } catch (error: any) {
        const msgs: string[] = Array.isArray(error?.message)
          ? error.message
          : [error?.message ?? "Có lỗi xảy ra"];
        msgs.forEach((m) => toast.error(m));
      }
    }
  };

  // ── Confirm handler (for review confirm) ────────────────────────────────────
  const handleConfirm = async () => {
    if (!enterprise?.id || !reviewPayload) return;
    setIsSubmitting(true);
    try {
      const { taxCode, ...updatePayload } = reviewPayload;
      await businessService.updateEnterprise(enterprise.id, updatePayload);
      toast.success("Cập nhật doanh nghiệp thành công");
      try {
        clearBusinessDraft("business-draft");
      } catch (e) {}

      router.push("/dashboard/business/businesses");
    } catch (error: any) {
      const msgs: string[] = Array.isArray(error?.message)
        ? error.message
        : [error?.message ?? "Có lỗi xảy ra"];
      msgs.forEach((m) => toast.error(m));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Back handler (for review back) ──────────────────────────────────────────
  const handleBack = async () => {
    try {
      const draft = await loadBusinessDraft("business-draft");
      if (draft) {
        setDraftInitial(draft);
      }
    } catch (err) {
      console.error("Error loading draft on back:", err);
    }
    setStep(1);
  };

  // ── Cancel handler ──────────────────────────────────────────────────────────
  const handleCancel = () => {
    if (isAdmin) {
      router.push("/dashboard/business/businesses");
    } else {
      // Enterprise: reload để khôi phục dữ liệu gốc
      fetchEnterprise();
    }
  };

  // ── Email change success ────────────────────────────────────────────────────
  const handleEmailChangeSuccess = (newEmail: string) => {
    setShowEmailModal(false);
    // Cập nhật email trong local state để form hiển thị luôn email mới
    if (enterprise) {
      setEnterprise({ ...enterprise, email: newEmail });
    }
    // Reload đầy đủ từ server
    fetchEnterprise();
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  if (!enterprise) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p className="text-sm">Không tìm thấy thông tin doanh nghiệp.</p>
      </div>
    );
  }

  if (step === 2 && reviewPayload) {
    return (
      <div className="flex flex-col gap-4">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại chỉnh sửa
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            Xác nhận cập nhật thông tin
          </h1>
        </div>

        {/* ── Review component ────────────────────────────────────────────────── */}
        <EditBusinessReview
          data={reviewPayload}
          onBack={handleBack}
          onConfirm={handleConfirm}
          isLoading={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {isAdmin && (
          <button
            type="button"
            onClick={() => router.push("/dashboard/business/businesses")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-800">
          Cập nhật doanh nghiệp
          {enterprise.name ? ` — ${enterprise.name}` : ""}
        </h1>
      </div>

      {/* ── Form ───────────────────────────────────────────────────────────── */}
      <BusinessForm
        mode="edit"
        initialData={draftInitial || enterprise}
        onSubmitDirect={handleSubmit}
        onCancel={handleCancel}
        // Admin: email bị khóa; Enterprise: có nút "Thay đổi"
        emailReadonly={true}
        onChangeEmail={isEnterprise ? () => setShowEmailModal(true) : undefined}
      />

      {/* ── Modal đổi email (chỉ Enterprise) ───────────────────────────────── */}
      {isEnterprise && (
        <ChangeEmailEnterpriseModal
          open={showEmailModal}
          currentEmail={enterprise.email ?? ""}
          onClose={() => setShowEmailModal(false)}
          onSuccess={handleEmailChangeSuccess}
        />
      )}
    </div>
  );
}
