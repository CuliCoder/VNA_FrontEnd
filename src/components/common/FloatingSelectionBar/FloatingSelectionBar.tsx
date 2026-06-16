import React, { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../Button/Button';

export interface FloatingSelectionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete?: () => void;
  deleteText?: string;
  className?: string;
}

export function FloatingSelectionBar({
  selectedCount,
  onClearSelection,
  onDelete,
  deleteText = 'Xóa dữ liệu',
  className,
}: FloatingSelectionBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (selectedCount > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [selectedCount]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300',
        className
      )}
    >
      <div className="bg-white shadow-xl rounded-full border border-gray-200 px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center bg-blue-600 text-white font-medium text-sm h-6 min-w-[24px] px-2 rounded-full">
            {selectedCount}
          </span>
          <span className="text-sm text-gray-700 font-medium">dữ liệu được chọn</span>
        </div>

        <div className="w-px h-6 bg-gray-200"></div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <Button variant="danger" size="sm" onClick={onDelete} className="rounded-full px-4">
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteText}
            </Button>
          )}

          <button
            onClick={onClearSelection}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            title="Bỏ chọn tất cả"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
