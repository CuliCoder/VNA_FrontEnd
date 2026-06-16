"use client";

import React from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  messages: string[];
  onClose: () => void;
}

export default function ValidationModal({ open, messages, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 flex items-center justify-between border-b">
          <h3 className="text-sm font-semibold">Lỗi xác thực từ server</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 mb-3">Các lỗi sau đã xảy ra:</p>
          <ul className="list-disc pl-5 space-y-2">
            {messages.map((m, i) => (
              <li key={i} className="text-sm text-red-600">{m}</li>
            ))}
          </ul>
        </div>

        <div className="px-5 py-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
