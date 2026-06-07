"use client";
import * as React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
type Step = "forgot" | "reset";
export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [step, setStep] = React.useState<Step>("forgot");
  return (
    <AuthLayout>
      {step === "forgot" && (
        <ForgotPasswordForm
          onSuccess={(submittedEmail: string) => {
            setEmail(submittedEmail);
            setStep("reset");
          }}
        />
      )}

      {step === "reset" && <ResetPasswordForm email={email} />}
    </AuthLayout>
  );
}
