import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  className?: string;
}

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  className,
}: PaginationProps) {
  const startIdx = Math.min((page - 1) * limit + 1, total);
  const endIdx = Math.min(page * limit, total);

  return (
    <div className={cn('flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50', className)}>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          Hiển thị <span className="font-medium text-gray-900">{total > 0 ? startIdx : 0}</span> đến{' '}
          <span className="font-medium text-gray-900">{endIdx}</span> trong{' '}
          <span className="font-medium text-gray-900">{total}</span>
        </span>
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Số dòng:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="border-gray-200 rounded-md text-sm py-1 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-sm text-gray-600 px-2">
          Trang <span className="font-medium text-gray-900">{page}</span> / {totalPages || 1}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
