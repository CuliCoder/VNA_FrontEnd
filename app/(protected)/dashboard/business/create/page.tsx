"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BusinessForm, { ReviewData } from "@/components/business/businessses/BusinessForm";
import { mapFormToBusinessRequest, mapReviewToBusinessRequest } from "@/components/business/businessses/mapper";
import BusinessReview from "@/components/business/businessses/BusinessReview";
import { businessService } from "@/services/businessService";
import { X } from "lucide-react";
import ValidationModal from "@/components/common/ValidationModal";
import { loadBusinessDraft, clearBusinessDraft } from "@/lib/sessionForm";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Thông tin doanh nghiệp" },
    { n: 2, label: "Xác nhận đăng ký" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100">
      {steps.map((step, idx) => {
        const isActive = step.n === currentStep;
        const isDone = step.n < currentStep;
        return (
          <React.Fragment key={step.n}>
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${isDone
                  ? "bg-green-500 text-white"
                  : isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-gray-200 text-gray-400"
                  }`}
              >
                {isDone ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.n
                )}
              </span>
              <span
                className={`text-sm font-medium transition-colors ${isActive ? "text-blue-700" : isDone ? "text-green-600" : "text-gray-400"
                  }`}
              >
                {step.label}
              </span>
            </div>
            {idx === 0 && (
              <div className={`w-16 h-0.5 mx-4 flex-shrink-0 rounded transition-colors ${currentStep === 2 ? "bg-blue-400" : "bg-gray-200"
                }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Account Info Popup ───────────────────────────────────────────────────────

interface AccountInfoPopupProps {
  username: string;
  password: string;
  onClose: () => void;
}

function AccountInfoPopup({ username, password, onClose }: AccountInfoPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Card */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xs mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Thông tin tài khoản</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm text-gray-700">
              Tài khoản:{" "}
              <span className="font-bold text-gray-900">{username}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="text-sm text-gray-700">
              Mật khẩu:{" "}
              <span className="font-bold text-gray-900">{password}</span>
            </span>
          </div>

          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 leading-relaxed">
              ⚠ Vui lòng lưu lại thông tin tài khoản. Mật khẩu sẽ không được hiển thị lại.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm"
          >
            Đã hiểu, đóng lại
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreateBusinessPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<ReviewData | null>(null);
  const [draftInitial, setDraftInitial] = React.useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationMessages, setValidationMessages] = useState<string[] | null>(null);

  // Account info popup state
  const [accountInfo, setAccountInfo] = useState<{
    username: string;
    password: string;
  } | null>(null);

  // ── Step 1 → Step 2 ──────────────────────────────────────────────────
  const handleNext = (data: ReviewData) => {
    setFormData(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load draft from session if exists
  useEffect(() => {
    (async () => {
      try {
        const draft = await loadBusinessDraft("business-draft");
        if (draft) {
          // draft shape may include documents or files
          setDraftInitial(draft);
          // Pre-fill form for editing
          if (!draft.name && !draft.taxCode) {
            // keep step 1
          }
        }
      } catch (err) {
        console.error("Error loading draft:", err);
      }
    })();
  }, []);

  // When coming back to Step 1, reload draft in case review saved it
  useEffect(() => {
    if (step !== 1) return;
    (async () => {
      try {
        const draft = await loadBusinessDraft("business-draft");
        if (draft) setDraftInitial(draft);
      } catch (err) {
        console.error("Error reloading draft:", err);
      }
    })();
  }, [step]);

  // ── Step 2 → Confirm ──────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!formData) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // If review data contains documents with File objects (or blob URLs),
      // upload those first and build a clean documents array for the API.
      let finalDocuments: any[] | undefined = undefined;

      if (Array.isArray(formData.documents) && formData.documents.length > 0) {
        // Collect files to upload and keep mapping to original indexes
        const uploadFiles: File[] = [];
        const uploadIndexMap: number[] = [];

        formData.documents.forEach((d: any, i: number) => {
          if (d?.file instanceof File) {
            uploadIndexMap.push(i);
            uploadFiles.push(d.file as File);
          }
        });

        let uploaded: any[] = [];
        if (uploadFiles.length > 0) {
          uploaded = await businessService.uploadFiles(uploadFiles, formData.taxCode);
        }

        // Build finalDocuments: use uploaded info where applicable, else use existing filePath/fileName
        finalDocuments = formData.documents
          .map((d: any, i: number) => {
            const uploadPos = uploadIndexMap.indexOf(i);
            if (uploadPos !== -1) {
              const up = uploaded[uploadPos];
              return {
                documentName: d.documentName || up?.documentName,
                documentType: up?.documentType || d.documentType,
                fileName: up?.fileName || d.fileName,
                filePath: up?.filePath || d.filePath,
                mimeType: up?.mimeType || d.mimeType,
                fileSize: up?.fileSize || d.fileSize,
              };
            }

            // already uploaded or provided filePath — ensure we don't send `file`/`url`
            return {
              documentName: d.documentName,
              documentType: d.documentType,
              fileName: d.fileName,
              filePath: d.filePath || d.url,
              mimeType: d.mimeType,
              fileSize: d.fileSize,
            };
          })
          .filter((d: any) => d.filePath || d.fileName); // Ensure we don't send empty document placeholders
      }

      const payload = mapReviewToBusinessRequest({ ...formData, documents: finalDocuments });
      const result = await businessService.createBusiness(payload);
      toast.success("Đăng ký doanh nghiệp thành công!");

      // clear draft on successful submit
      try {
        clearBusinessDraft("business-draft");
      } catch (e) {
        /* ignore */
      }

      // Show account info popup
      if (result?.account) {
        setAccountInfo({
          username: result.account.username,
          password: result.account.password,
        });
      } else {
        // Fallback nếu API chưa trả account
        setAccountInfo({
          username: formData.taxCode,
          password: "12345678",
        });
      }
    } catch (err: any) {
      console.log("ERROR TYPE:", {
        err,
        constructor: err?.constructor?.name,
        isAxios: axios.isAxiosError(err),
      });
      // Try to extract validation messages from the backend response
      const msgs = err?.errors || err?.response?.data?.messages || err?.response?.data?.errors;
      if (Array.isArray(msgs) && msgs.length > 0) {
        setValidationMessages(msgs.map(String));
      } else if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Close popup → redirect ────────────────────────────────────────────
  const handleClosePopup = () => {
    setAccountInfo(null);
    router.push("/dashboard/business/businesses");
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Step Indicator */}
      <StepIndicator currentStep={step} />

      {/* Error banner */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex justify-between items-center">
          <span>⚠ {submitError}</span>
          <button onClick={() => setSubmitError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 1 – Form */}
      {step === 1 && (
        <BusinessForm
          mode="step"
          onNext={handleNext}
          initialData={draftInitial || undefined}
        />
      )}

      {/* Step 2 – Review */}
      {step === 2 && formData && (
        <BusinessReview
          data={formData}
          onBack={() => setStep(1)}
          onConfirm={handleConfirm}
          isLoading={isSubmitting}
        />
      )}

      {/* Account Info Popup */}
      {accountInfo && (
        <AccountInfoPopup
          username={accountInfo.username}
          password={accountInfo.password}
          onClose={handleClosePopup}
        />
      )}

      <ValidationModal
        open={!!validationMessages}
        messages={validationMessages || []}
        onClose={() => setValidationMessages(null)}
      />
    </div>
  );
}
