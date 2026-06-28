"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Download, Upload, Plus, ChevronDown, Check, Save, Pencil } from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell,
  Button,
  Pagination,
  Modal,
  FloatingSelectionBar,
  DeleteConfirmModal
} from "@/components/common";
import { categoryService, Category, CategoryType } from "@/services/categoryService";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { CategoryImportPreviewModal } from "./_components/CategoryImportPreviewModal";

// ─── Constants & Options ──────────────────────────────────────────
interface CategoryOption {
  value: CategoryType;
  label: string;
  codeLabel: string;
  nameLabel: string;
}

// Hide ACCIDENT_CAUSE from UI selector as requested
const CATEGORIES: CategoryOption[] = [
  {
    value: "INJURY_FACTOR",
    label: "Yếu tố gây chấn thương",
    codeLabel: "Mã yếu tố chấn thương",
    nameLabel: "Tên yếu tố chấn thương",
  },
  {
    value: "INJURY_TYPE",
    label: "Loại chấn thương",
    codeLabel: "Mã loại chấn thương",
    nameLabel: "Tên loại chấn thương",
  },
  {
    value: "OCCUPATION",
    label: "Danh mục nghề nghiệp",
    codeLabel: "Mã nghề nghiệp",
    nameLabel: "Tên danh mục nghề nghiệp",
  },
];

const LEVEL_LABELS: Record<number, string> = {
  1: "Cấp 1",
  2: "Cấp 2",
  3: "Cấp 3",
  4: "Cấp 4",
};

// ─── Hierarchy display ─────────────────────────────────────────────
const getLevelIndent = (level: number) => {
  if (level <= 1) return "";
  return "— ".repeat(level - 1);
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommonCategoriesPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selector state
  const [selectedType, setSelectedType] = useState<CategoryType>("INJURY_FACTOR");

  // Data state
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterCode, setFilterCode] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Selection state
  const [selectedIdsSet, setSelectedIdsSet] = useState<Set<number>>(new Set());

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    code: "",
    name: "",
    status: true,
    level: 1,
    parentId: "" as string | number,
  });
  const [savingCategory, setSavingCategory] = useState(false);

  // Import preview state
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);

  // ─── Fetch Categories ───────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setAllCategories(data);
    } catch (err: any) {
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể lấy danh sách danh mục từ hệ thống.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Current category configuration
  const currentCat = CATEGORIES.find((c) => c.value === selectedType)!;

  // Local filter
  const filtered = allCategories.filter((item) => {
    if (item.type !== selectedType) return false;
    if (filterCode && !item.code.toLowerCase().includes(filterCode.toLowerCase())) return false;
    if (filterName && !item.name.toLowerCase().includes(filterName.toLowerCase())) return false;
    if (filterLevel && item.level !== Number(filterLevel)) return false;
    if (filterStatus === "ACTIVE" && !item.status) return false;
    if (filterStatus === "INACTIVE" && item.status) return false;
    return true;
  });

  // Pagination calculation
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedData = filtered.slice((page - 1) * limit, page * limit);

  // Selection helpers
  const isAllSelected = paginatedData.length > 0 && paginatedData.every((item) => selectedIdsSet.has(item.id));
  const isPartiallySelected = paginatedData.some((item) => selectedIdsSet.has(item.id)) && !isAllSelected;

  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIdsSet);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIdsSet(newSet);
  };

  const selectAll = () => {
    const newSet = new Set(selectedIdsSet);
    paginatedData.forEach((item) => newSet.add(item.id));
    setSelectedIdsSet(newSet);
  };

  const clearSelection = () => {
    setSelectedIdsSet(new Set());
  };

  // ─── Export Excel (3 sheets) ─────────────────────────────────────────────────
  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    const exportConfigs = [
      { type: "INJURY_FACTOR" as CategoryType, sheetName: "Yếu tố gây chấn thương" },
      { type: "INJURY_TYPE" as CategoryType, sheetName: "Loại chấn thương" },
      { type: "OCCUPATION" as CategoryType, sheetName: "Danh mục nghề nghiệp" },
    ];

    exportConfigs.forEach((config) => {
      const typeData = allCategories.filter((item) => item.type === config.type);
      const rows = typeData.map((item) => ({
        "Mã (Code)": item.code,
        "Tên (Name)": item.name,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [{ wch: 15 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, ws, config.sheetName);
    });

    XLSX.writeFile(wb, "danh_muc_chung.xlsx");
    toast({
      title: "Xuất file thành công",
      description: "Đã xuất dữ liệu 3 danh mục chính ra file excel.",
    });
  };

  // ─── Export Sample Template File ──────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Template Import
    const templateData = [
      {
        type: "ACCIDENT_CAUSE",
        code: "A01",
        name: "Vi phạm quy chuẩn an toàn",
        parentId: "",
        level: 1,
        status: true
      },
      {
        type: "INJURY_FACTOR",
        code: "FACTOR_01",
        name: "Điện",
        parentId: "",
        level: 1,
        status: true
      }
    ];
    const wsTemplate = XLSX.utils.json_to_sheet(templateData, {
      header: ["type", "code", "name", "parentId", "level", "status"]
    });
    wsTemplate["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 10 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsTemplate, "Template Import");

    // Sheet 2: Reference
    const referenceData = [
      { "Mã Danh Mục (type)": "INJURY_FACTOR", "Ý nghĩa": "Yếu tố gây chấn thương" },
      { "Mã Danh Mục (type)": "INJURY_TYPE", "Ý nghĩa": "Loại chấn thương" },
      { "Mã Danh Mục (type)": "OCCUPATION", "Ý nghĩa": "Danh mục nghề nghiệp" },
      { "Mã Danh Mục (type)": "ACCIDENT_CAUSE", "Ý nghĩa": "Nguyên nhân tai nạn" }
    ];
    const wsRef = XLSX.utils.json_to_sheet(referenceData);
    wsRef["!cols"] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsRef, "Danh sách Mã");

    XLSX.writeFile(wb, "danh_muc_mau_import.xlsx");
    toast({
      title: "Tải file mẫu thành công",
      description: "Đã tải file mẫu import danh mục.",
    });
  };

  // ─── Import Excel ────────────────────────────────────────────────────────────
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet);

        const mapExcelRow = (row: any) => {
          const getVal = (keys: string[]) => {
            for (const key of keys) {
              if (row[key] !== undefined) return row[key];
              const foundKey = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
              if (foundKey) return row[foundKey];
            }
            return undefined;
          };

          const type = getVal(["type", "Loại", "Loại danh mục"]);
          const code = getVal(["code", "Mã", "Mã danh mục"]);
          const name = getVal(["name", "Tên", "Tên danh mục"]);
          const parentId = getVal(["parentId", "parent_id", "Mã cha", "ID Cha"]);
          const level = getVal(["level", "Cấp", "Bậc"]);
          const statusVal = getVal(["status", "Trạng thái", "Sử dụng"]);

          let status = true;
          if (statusVal !== undefined) {
            if (typeof statusVal === "string") {
              const val = statusVal.toLowerCase().trim();
              status = val !== "false" && val !== "0" && val !== "không sử dụng" && val !== "ko";
            } else {
              status = Boolean(statusVal);
            }
          }

          return {
            type: String(type || "").trim(),
            code: String(code || "").trim(),
            name: String(name || "").trim(),
            parentId: parentId ? Number(parentId) : null,
            level: level ? Number(level) : 1,
            status,
          };
        };

        const parsedData = rawJson.map(mapExcelRow);
        setImportPreviewData(parsedData);
        setShowImportPreview(true);
      } catch (err: any) {
        toast({
          title: "Lỗi đọc file",
          description: "Không thể phân tích dữ liệu từ file Excel.",
          variant: "destructive",
        });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ""; 
  };

  // ─── Modal Add / Edit ────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setModalMode("create");
    setEditingId(null);
    setForm({
      code: "",
      name: "",
      status: true,
      level: 1,
      parentId: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: Category) => {
    setModalMode("edit");
    setEditingId(item.id);
    setForm({
      code: item.code,
      name: item.name,
      status: item.status,
      level: item.level,
      parentId: item.parentId || "",
    });
    setShowModal(true);
  };

  const handleSaveCategory = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ mã và tên danh mục.",
        variant: "destructive",
      });
      return;
    }

    setSavingCategory(true);
    try {
      const parentVal = form.parentId === "" ? null : Number(form.parentId);
      if (modalMode === "create") {
        await categoryService.createCategory({
          type: selectedType,
          code: form.code.trim(),
          name: form.name.trim(),
          status: form.status,
          parentId: parentVal,
          level: Number(form.level),
        });
        toast({
          title: "Tạo thành công",
          description: `Đã thêm mới danh mục vào ${currentCat.label}.`,
        });
      } else if (editingId) {
        await categoryService.updateCategory(editingId, {
          code: form.code.trim(),
          name: form.name.trim(),
          status: form.status,
          parentId: parentVal,
          level: Number(form.level),
        });
        toast({
          title: "Cập nhật thành công",
          description: `Đã cập nhật danh mục.`,
        });
      }

      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể lưu danh mục.",
        variant: "destructive",
      });
    } finally {
      setSavingCategory(false);
    }
  };

  // ─── Toggle Status ───────────────────────────────────────────────────────────
  const handleToggleStatus = async (item: Category) => {
    const updatedStatus = !item.status;
    setAllCategories((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, status: updatedStatus } : c))
    );

    try {
      await categoryService.updateCategory(item.id, { status: updatedStatus });
      toast({
        title: "Đã cập nhật",
        description: `Đã chuyển trạng thái danh mục thành ${
          updatedStatus ? "Hoạt động" : "Không hoạt động"
        }.`,
      });
    } catch (err: any) {
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể đổi trạng thái danh mục.",
        variant: "destructive",
      });
      fetchCategories(); 
    }
  };

  // ─── Bulk Delete ─────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const idsToDelete = Array.from(selectedIdsSet);
    try {
      await Promise.all(idsToDelete.map((id) => categoryService.deleteCategory(id)));
      toast({
        title: "Xóa thành công",
        description: `Đã xóa ${idsToDelete.length} danh mục được chọn.`,
      });
      clearSelection();
      fetchCategories();
    } catch (err: any) {
      toast({
        title: "Lỗi khi xóa",
        description: "Có lỗi xảy ra khi xóa một số danh mục.",
        variant: "destructive",
      });
      fetchCategories();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // ─── Dropdown options for parent items ──────────────────────────────────────
  // Items matching selectedType with level = targetLevel - 1
  const parentCandidates = allCategories.filter(
    (item) => item.type === selectedType && item.level === Number(form.level) - 1
  );

  return (
    <div className="flex flex-col h-full relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* 🟢 Header 🟢 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-800 mb-2">
            Khai báo danh mục
          </h1>
          <div className="relative inline-block">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as CategoryType);
                setFilterCode("");
                setFilterName("");
                setFilterLevel("");
                setFilterStatus("");
                setPage(1);
                clearSelection();
              }}
              className="h-9 pl-3 pr-8 border border-gray-300 rounded text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[240px]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Tải file mẫu
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Xuất danh sách
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Thêm từ file
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* 🟢 Table Card 🟢 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              {/* Dynamic Headers based on selected category type */}
              {selectedType === "INJURY_FACTOR" && (
                <>
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isPartiallySelected;
                        }}
                        onChange={() => {
                          if (isAllSelected) clearSelection();
                          else selectAll();
                        }}
                      />
                    </TableHead>
                    <TableHead className="w-[180px]">Mã yếu tố</TableHead>
                    <TableHead>Yếu tố gây chấn thương</TableHead>
                    <TableHead className="w-[180px]">Trạng thái</TableHead>
                  </TableRow>

                  {/* Filter Row */}
                  <TableRow className="bg-gray-50/50">
                    <TableCell></TableCell>
                    <TableCell className="p-2">
                      <input
                        className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Lọc mã..."
                        value={filterCode}
                        onChange={(e) => { setFilterCode(e.target.value); setPage(1); }}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <input
                        className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Lọc tên..."
                        value={filterName}
                        onChange={(e) => { setFilterName(e.target.value); setPage(1); }}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <select
                        className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                      >
                        <option value="">Tất cả</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                      </select>
                    </TableCell>
                  </TableRow>
                </>
              )}

              {selectedType === "OCCUPATION" && (
                <>
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isPartiallySelected;
                        }}
                        onChange={() => {
                          if (isAllSelected) clearSelection();
                          else selectAll();
                        }}
                      />
                    </TableHead>
                    <TableHead className="w-[100px] text-center">Thao tác</TableHead>
                    <TableHead className="w-[180px]">Mã nghề</TableHead>
                    <TableHead>Tên nghề nghiệp</TableHead>
                    <TableHead className="w-[180px]">Cấp</TableHead>
                  </TableRow>

                  {/* Filter Row */}
                  <TableRow className="bg-gray-50/50">
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="p-2">
                      <input
                        className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Lọc mã..."
                        value={filterCode}
                        onChange={(e) => { setFilterCode(e.target.value); setPage(1); }}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <input
                        className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Lọc tên..."
                        value={filterName}
                        onChange={(e) => { setFilterName(e.target.value); setPage(1); }}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <select
                        className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        value={filterLevel}
                        onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
                      >
                        <option value="">Tất cả</option>
                        <option value="1">Cấp 1</option>
                        <option value="2">Cấp 2</option>
                        <option value="3">Cấp 3</option>
                        <option value="4">Cấp 4</option>
                      </select>
                    </TableCell>
                  </TableRow>
                </>
              )}

              {selectedType === "INJURY_TYPE" && (
                <>
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isPartiallySelected;
                        }}
                        onChange={() => {
                          if (isAllSelected) clearSelection();
                          else selectAll();
                        }}
                      />
                    </TableHead>
                    <TableHead className="w-[180px]">Mã số</TableHead>
                    <TableHead>Tên loại chấn thương</TableHead>
                    <TableHead className="w-[180px]">Cấp</TableHead>
                    <TableHead className="w-[100px] text-center">Thao tác</TableHead>
                  </TableRow>

                  {/* Filter Row */}
                  <TableRow className="bg-gray-50/50">
                    <TableCell></TableCell>
                    <TableCell className="p-2">
                      <input
                        className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Lọc mã..."
                        value={filterCode}
                        onChange={(e) => { setFilterCode(e.target.value); setPage(1); }}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <input
                        className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Lọc tên..."
                        value={filterName}
                        onChange={(e) => { setFilterName(e.target.value); setPage(1); }}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <select
                        className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        value={filterLevel}
                        onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
                      >
                        <option value="">Tất cả</option>
                        <option value="1">Cấp 1</option>
                        <option value="2">Cấp 2</option>
                        <option value="3">Cấp 3</option>
                      </select>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </>
              )}
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={selectedType === "INJURY_FACTOR" ? 4 : 5}
                    className="py-16 text-center text-gray-400"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Đang tải dữ liệu...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={selectedType === "INJURY_FACTOR" ? 4 : 5}
                    className="py-16 text-center text-gray-400 text-sm"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id} className="group">
                    {/* Col 1: Checkbox */}
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedIdsSet.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                      />
                    </TableCell>

                    {/* RENDERING TABLE CELLS BY SELECTED TYPE */}
                    {selectedType === "INJURY_FACTOR" && (
                      <>
                        <TableCell className="text-gray-600 font-medium">{item.code}</TableCell>
                        <TableCell className="font-medium text-gray-800">{item.name}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`w-10 h-5 rounded-full relative transition-all duration-200 focus:outline-none ${
                              item.status ? "bg-blue-600" : "bg-gray-300"
                            }`}
                            title={item.status ? "Hoạt động" : "Không hoạt động"}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full bg-white shadow absolute top-0.5 transition-transform duration-200 ${
                                item.status ? "translate-x-5" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </TableCell>
                      </>
                    )}

                    {selectedType === "OCCUPATION" && (
                      <>
                        {/* Thao tác on left */}
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </TableCell>
                        <TableCell className="text-gray-600 font-medium">{item.code}</TableCell>
                        <TableCell className="font-medium text-gray-800">
                          <span className="text-gray-400 font-normal">{getLevelIndent(item.level)}</span>
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            {LEVEL_LABELS[item.level] ?? `Cấp ${item.level}`}
                          </span>
                        </TableCell>
                      </>
                    )}

                    {selectedType === "INJURY_TYPE" && (
                      <>
                        <TableCell className="text-gray-600 font-medium">{item.code}</TableCell>
                        <TableCell className="font-medium text-gray-800">
                          <span className="text-gray-400 font-normal">{getLevelIndent(item.level)}</span>
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            {LEVEL_LABELS[item.level] ?? `Cấp ${item.level}`}
                          </span>
                        </TableCell>
                        {/* Thao tác on right */}
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 🟢 Footer / Pagination 🟢 */}
        <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50/30 shrink-0 pr-4">
          <Pagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
            className="border-none bg-transparent py-2.5 px-0"
          />
        </div>
      </div>

      {/* 🟢 Add/Edit Modal (Styled matching mockup) 🟢 */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === "create" ? "Thêm mới" : "Chỉnh sửa"}
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full pt-1">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition"
            >
              Huỷ
            </button>
            <Button
              variant="primary"
              onClick={handleSaveCategory}
              isLoading={savingCategory}
              className="flex items-center gap-1.5 px-5 py-2 font-semibold shadow-sm"
            >
              <Save className="w-4 h-4" />
              Lưu
            </Button>
          </div>
        }
      >
        <div className="space-y-5 pt-3">
          {/* Floating outline input for Code */}
          <div className="relative">
            <input
              type="text"
              id="category_code"
              placeholder=" "
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              className="block px-3 py-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 peer"
            />
            <label
              htmlFor="category_code"
              className="absolute text-xs text-gray-500 duration-300 transform -translate-y-4 scale-95 top-2 z-10 origin-[0] bg-white px-1.5 left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-95 peer-focus:-translate-y-4 peer-focus:text-blue-500"
            >
              {currentCat.codeLabel} <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Floating outline input for Name */}
          <div className="relative">
            <input
              type="text"
              id="category_name"
              placeholder=" "
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="block px-3 py-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 peer"
            />
            <label
              htmlFor="category_name"
              className="absolute text-xs text-gray-500 duration-300 transform -translate-y-4 scale-95 top-2 z-10 origin-[0] bg-white px-1.5 left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-95 peer-focus:-translate-y-4 peer-focus:text-blue-500"
            >
              {currentCat.nameLabel} <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Optional Level Dropdown for Hierarchy support */}
          {selectedType !== "INJURY_FACTOR" && (
            <>
              <div className="relative">
                <select
                  id="category_level"
                  value={form.level}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      level: Number(e.target.value),
                      parentId: "", // Reset parent when level changes
                    }));
                  }}
                  className="block px-3 py-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">Cấp 1</option>
                  <option value="2">Cấp 2</option>
                  <option value="3">Cấp 3</option>
                  {selectedType === "OCCUPATION" && <option value="4">Cấp 4</option>}
                </select>
                <label
                  htmlFor="category_level"
                  className="absolute text-xs text-gray-500 top-2 z-10 origin-[0] bg-white px-1.5 left-2 -translate-y-4 scale-95"
                >
                  Cấp danh mục <span className="text-red-500">*</span>
                </label>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {Number(form.level) > 1 && (
                <div className="relative">
                  <select
                    id="category_parent"
                    value={form.parentId}
                    onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value }))}
                    className="block px-3 py-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn danh mục cha...</option>
                    {parentCandidates.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="category_parent"
                    className="absolute text-xs text-gray-500 top-2 z-10 origin-[0] bg-white px-1.5 left-2 -translate-y-4 scale-95"
                  >
                    Danh mục cha <span className="text-red-500">*</span>
                  </label>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}
            </>
          )}

          {/* Floating outline select for Status */}
          <div className="relative">
            <select
              id="category_status"
              value={form.status ? "true" : "false"}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value === "true" }))}
              className="block px-3 py-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="true">Sử dụng</option>
              <option value="false">Không sử dụng</option>
            </select>
            <label
              htmlFor="category_status"
              className="absolute text-xs text-gray-500 top-2 z-10 origin-[0] bg-white px-1.5 left-2 -translate-y-4 scale-95"
            >
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </Modal>

      {/* 🟢 Bulk Delete Floating Selection Bar 🟢 */}
      <FloatingSelectionBar
        selectedCount={selectedIdsSet.size}
        onClearSelection={clearSelection}
        onDelete={() => setShowDeleteConfirm(true)}
        deleteText="Xóa danh mục"
      />

      {/* 🟢 Delete Confirmation Modal 🟢 */}
      <DeleteConfirmModal
        open={showDeleteConfirm}
        ids={Array.from(selectedIdsSet)}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />

      {/* 🟢 Excel Import Preview Modal 🟢 */}
      <CategoryImportPreviewModal
        open={showImportPreview}
        onClose={() => setShowImportPreview(false)}
        previewData={importPreviewData}
        onSuccess={() => {
          setShowImportPreview(false);
          fetchCategories();
        }}
      />
    </div>
  );
}
