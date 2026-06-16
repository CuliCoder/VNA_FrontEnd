"use client";

import React, { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as SelectPrimitive from "@radix-ui/react-select";
import { X, ChevronDown, Check } from "lucide-react";
import {
  businessFieldService,
  BusinessField,
  BusinessFieldCreateRequest,
  BusinessFieldUpdateRequest,
} from "@/services/businessFieldService";

interface BusinessFieldModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** When provided, the modal is in "edit" mode */
  editItem?: BusinessField | null;
  /** All business fields for parent selector */
  allFields: BusinessField[];
}

export default function BusinessFieldModal({
  open,
  onClose,
  onSuccess,
  editItem,
  allFields,
}: BusinessFieldModalProps) {
  const isEdit = !!editItem;

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("none");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
  if (editItem) {
    setCode(editItem.code);
    setName(editItem.name);
    setParentId(
      editItem.parentId != null ? String(editItem.parentId) : "none"
    );
    setStatus(editItem.status ? "active" : "inactive");
  } else {
    setCode("");
    setName("");
    setParentId("none");
    setStatus("active");
  }
}, [editItem, open]);

  const handleSave = async () => {
  if (!name.trim()) return;

  if (!isEdit && !code.trim()) return;

  setIsSubmitting(true);

  try {
    const resolvedParentId =
      parentId === "none" ? null : Number(parentId);

    if (isEdit && editItem) {
      const payload: BusinessFieldUpdateRequest = {
        name: name.trim(),
        status: status === "active",
      };

      await businessFieldService.updateBusinessField(
        editItem.id,
        payload
      );
    } else {
      const payload: BusinessFieldCreateRequest = {
        code: code.trim(),
        name: name.trim(),
        parentId: resolvedParentId,
        status: status === "active",
      };

      await businessFieldService.createBusinessField(payload);
    }

    onSuccess();
    resetForm();
  } catch (error) {
    console.error("Failed to save business field", error);
  } finally {
    setIsSubmitting(false);
  }
};

  const resetForm = () => {
    setCode("");
    setName("");
    setParentId("none");
    setStatus("active");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  // Eligible parents: exclude self and its descendants when editing
  const eligibleParents = isEdit
    ? allFields.filter((f) => f.id !== editItem?.id)
    : allFields;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg overflow-hidden">
          {/* Blue Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
            <DialogPrimitive.Title className="text-sm font-medium text-white">
              {isEdit
                ? "Cập nhật ngành nghề kinh doanh"
                : "Thêm mới ngành nghề kinh doanh"}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-sm">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-4">
            {/* Mã ngành */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Mã ngành <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                disabled={isEdit}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Tên ngành nghề */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Tên ngành <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Ngành cha */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Ngành cha
              </label>
              <SelectPrimitive.Root
                value={parentId}
                disabled={isEdit}
                onValueChange={(v) => setParentId(v)}
              >
                <SelectPrimitive.Trigger className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 data-[placeholder]:text-gray-400">
                  <SelectPrimitive.Value placeholder="— Không có ngành cha —" />
                  <SelectPrimitive.Icon>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Portal>
                  <SelectPrimitive.Content className="relative z-[60] min-w-[8rem] max-h-60 overflow-auto rounded-md border bg-white text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                    <SelectPrimitive.Viewport className="p-1">
                      {/* None option */}
                      <SelectPrimitive.Item
                        value="none"
                        className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      >
                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                          <SelectPrimitive.ItemIndicator>
                            <Check className="h-4 w-4" />
                          </SelectPrimitive.ItemIndicator>
                        </span>
                        <SelectPrimitive.ItemText>
                          — Không có ngành cha —
                        </SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>

                      {/* Eligible parent options */}
                      {eligibleParents.map((field) => (
                        <SelectPrimitive.Item
                          key={field.id}
                          value={String(field.id)}
                          className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                            <SelectPrimitive.ItemIndicator>
                              <Check className="h-4 w-4" />
                            </SelectPrimitive.ItemIndicator>
                          </span>
                          <SelectPrimitive.ItemText>
                            {field.code} - {field.name}
                          </SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                      ))}
                    </SelectPrimitive.Viewport>
                  </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
              </SelectPrimitive.Root>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Trạng thái
              </label>
              <SelectPrimitive.Root
                value={status}
                onValueChange={(v: "active" | "inactive") => setStatus(v)}
              >
                <SelectPrimitive.Trigger className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 data-[placeholder]:text-gray-400">
                  <SelectPrimitive.Value />
                  <SelectPrimitive.Icon>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Portal>
                  <SelectPrimitive.Content className="relative z-[60] min-w-[8rem] overflow-hidden rounded-md border bg-white text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                    <SelectPrimitive.Viewport className="p-1">
                      <SelectPrimitive.Item
                        value="active"
                        className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      >
                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                          <SelectPrimitive.ItemIndicator>
                            <Check className="h-4 w-4" />
                          </SelectPrimitive.ItemIndicator>
                        </span>
                        <SelectPrimitive.ItemText>
                          Sử dụng
                        </SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>
                      <SelectPrimitive.Item
                        value="inactive"
                        className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      >
                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                          <SelectPrimitive.ItemIndicator>
                            <Check className="h-4 w-4" />
                          </SelectPrimitive.ItemIndicator>
                        </span>
                        <SelectPrimitive.ItemText>
                          Không sử dụng
                        </SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>
                    </SelectPrimitive.Viewport>
                  </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
              </SelectPrimitive.Root>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              Huỷ bỏ
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !code.trim() || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
