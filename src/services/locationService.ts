import axios from "axios";

export interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
}

export interface Ward {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  district_code: number;
}

export interface District {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
  wards: Ward[];
}

export interface ProvinceWithDistricts extends Province {
  districts: District[];
}

const api = axios.create({
  baseURL: "https://provinces.open-api.vn/api/v2",
  timeout: 10000,
});

export const locationService = {
  getProvinces: async (): Promise<Province[]> => {
    const res = await api.get<Province[]>("/p/");
    return res.data;
  },

  getWardsByProvince: async (provinceCode: number): Promise<Ward[]> => {
    const res = await api.get<Ward[]>(`/w/?province=${provinceCode}`);
    return res.data;
  },
};
