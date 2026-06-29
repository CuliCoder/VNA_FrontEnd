import React, { useState } from "react";
import { Modal, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/common";
import { categoryService, CreateCategoryDto, CategoryType } from "@/services/categoryService";
import { useToast } from "@/hooks/use-toast";
import { Check, X, AlertCircle } from "lucide-react";

interface CategoryImportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  previewData: any[]; // Data parsed from Excel
}

export function CategoryImportPreviewModal({
  open,
  onClose,
  onSuccess,
  previewData,
}: CategoryImportPreviewModalProps) {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ id: number; success: boolean; message?: string }[]>([]);

  // We consider an item valid if it has type, code, and name
  const validateItem = (item: any) => {
    return !!item.type && !!item.code && !!item.name;
  };

  const handleConfirm = async () => {
    setIsImporting(true);
    const results: typeof importResults = [];

    for (let i = 0; i < previewData.length; i++) {
      const item = previewData[i];
      if (!validateItem(item)) {
        results.push({ id: i, success: false, message: "Thiếu trường bắt buộc" });
        continue;
      }

      try {
        const dto: CreateCategoryDto = {
          type: item.type as CategoryType,
          code: String(item.code).trim(),
          name: String(item.name).trim(),
          parentId: item.parentId ? Number(item.parentId) : null,
          level: item.level ? Number(item.level) : 1,
          status: item.status !== undefined ? Boolean(item.status) : true,
        };
        await categoryService.createCategory(dto);
        results.push({ id: i, success: true });
      } catch (err: any) {
        results.push({ id: i, success: false, message: err.message || "Lỗi lưu dữ liệu" });
      }
    }

    setImportResults(results);
    setIsImporting(false);

    const successCount = results.filter((r) => r.success).length;
    toast({
      title: "Hoàn tất import",
      description: `Thành công: ${successCount}/${previewData.length} danh mục.`,
    });

    if (successCount === previewData.length) {
      onSuccess(); // Close and refresh list
    }
  };

  const validCount = previewData.filter(validateItem).length;

  return (
    <Modal
      open={open}
      onClose={isImporting ? () => {} : onClose}
      title="Xem trước dữ liệu Import"
      size="xl"
      footer={
        <div className="flex justify-end gap-2 w-full pt-2">
          <Button variant="outline" onClick={onClose} disabled={isImporting}>
            Đóng
          </Button>
          {!importResults.length && (
            <Button
              variant="primary"
              onClick={handleConfirm}
              isLoading={isImporting}
              disabled={validCount === 0}
            >
              Xác nhận Lưu
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-hidden">
        {!importResults.length && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Tìm thấy {previewData.length} bản ghi (Hợp lệ: {validCount}). Vui lòng kiểm tra lại thông tin trước khi Xác nhận.
          </div>
        )}
        <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-12 text-center">STT</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Mã (Code)</TableHead>
                <TableHead>Tên (Name)</TableHead>
                <TableHead className="w-24 text-center">Level</TableHead>
                <TableHead className="w-32 text-center">Trạng thái</TableHead>
                <TableHead className="w-40">Kết quả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((item, index) => {
                const isValid = validateItem(item);
                const result = importResults.find((r) => r.id === index);

                return (
                  <TableRow key={index} className={!isValid ? "bg-red-50" : ""}>
                    <TableCell className="text-center text-gray-500">{index + 1}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-center">{item.level ?? 1}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs ${
                          item.status === false
                            ? "bg-gray-100 text-gray-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.status === false ? "Không sử dụng" : "Sử dụng"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {result ? (
                        result.success ? (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <Check className="w-4 h-4" /> Thành công
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600 text-sm" title={result.message}>
                            <X className="w-4 h-4" /> Thất bại
                          </div>
                        )
                      ) : !isValid ? (
                        <div className="text-red-500 text-sm">Dữ liệu không hợp lệ</div>
                      ) : (
                        <div className="text-gray-400 text-sm">Chờ xử lý</div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {previewData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                    Không có dữ liệu trong file Excel.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Modal>
  );
}
