"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import UserForm from "@/components/users/UserForm";
import type { User } from "@/types/auth";

export default function UserDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const userId = Number(params.id);

  // ?view=true → chế độ xem (read-only), mặc định là edit
  const isViewMode = searchParams.get("view") === "true";

  const handleSaveSuccess = (_user: User) => {
    router.push("/dashboard/users");
  };



  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Top action bar */}
      <div className="flex items-center justify-between bg-white px-6 py-3.5 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-base font-semibold text-gray-800">
          Chi tiết người dùng
        </h1>
        <div className="flex items-center gap-3">


          {/* Switch view/edit */}
          {isViewMode ? (
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/users/${userId}`)
              }
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition border border-blue-200"
            >
              Chỉnh sửa
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => router.push("/dashboard/users")}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition"
          >
            Hủy bỏ
          </button>

          {!isViewMode && (
            <button
              type="submit"
              form="user-form"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm flex items-center gap-1.5"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Lưu
            </button>
          )}
        </div>
      </div>

      <UserForm
        userId={userId}
        readOnly={isViewMode}
        
      />
    </div>
  );
}
