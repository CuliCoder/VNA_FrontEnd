import { Province, Ward } from "../types/address";
const BASE_URL = "https://provinces.open-api.vn/api/v2";

export const provincesService = {
  getProvinces: async (): Promise<Province[]> => {
    const res = await fetch(`${BASE_URL}/p/`);
    if (!res.ok) throw new Error("Không thể tải danh sách tỉnh/thành phố");
    return res.json();
  },

  getWards: async (provinceCode: number): Promise<Ward[]> => {
    const res = await fetch(`${BASE_URL}/w/?province=${provinceCode}`);
    if (!res.ok) throw new Error("Không thể tải danh sách phường/xã");
    return res.json();
  },
};
