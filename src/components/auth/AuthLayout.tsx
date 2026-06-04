"use client";
import * as React from "react";
import loginIllustration from "@/../public/login.png";
import emblemVN from "@/../public/Emblem_of_Vietnam.svg.png";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden">
        <Image
          src={loginIllustration}
          alt="Illustration"
          className="w-4/5 max-w-lg object-contain"
        />
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Emblem */}
          <div className="flex justify-center">
            <Image
              src={emblemVN}
              alt="Quốc huy Việt Nam"
              className="w-20 h-20 object-contain"
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
