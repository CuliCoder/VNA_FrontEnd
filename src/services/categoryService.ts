import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/apiConfig";

export type CategoryType = "INJURY_TYPE" | "INJURY_FACTOR" | "OCCUPATION" | "ACCIDENT_CAUSE";

export interface Category {
  id: number;
  type: CategoryType;
  code: string;
  name: string;
  parentId: number | null;
  level: number;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
  parent?: Category | null;
}

export interface CreateCategoryDto {
  type: CategoryType;
  code: string;
  name: string;
  parentId?: number | null;
  level?: number;
  status?: boolean;
}

export interface UpdateCategoryDto {
  code?: string;
  name?: string;
  parentId?: number | null;
  level?: number;
  status?: boolean;
}

export const categoryService = {
  // Lấy toàn bộ danh sách Category
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.ROOT);
    return response.data;
  },

  // Tạo mới một danh mục
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const response = await apiClient.post<Category>(
      API_ENDPOINTS.CATEGORIES.ROOT,
      data
    );
    return response.data;
  },

  // Cập nhật thông tin danh mục (thay đổi trạng thái hoặc nội dung)
  async updateCategory(id: number, data: UpdateCategoryDto): Promise<Category> {
    const response = await apiClient.patch<Category>(
      API_ENDPOINTS.CATEGORIES.DETAIL(id),
      data
    );
    return response.data;
  },

  // Xoá một danh mục
  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.DETAIL(id));
  },
};
