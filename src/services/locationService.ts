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
  baseURL: "https://provinces.open-api.vn/api",
  timeout: 10000,
});

export const locationService = {
  getProvinces: async (): Promise<Province[]> => {
    const res = await api.get<Province[]>("/p/");
    return res.data;
  },

  getWardsByProvince: async (provinceCode: number): Promise<Ward[]> => {
    // Fetch province with depth 3 to get districts and their wards
    const res = await api.get<ProvinceWithDistricts>(`/p/${provinceCode}?depth=3`);
    const province = res.data;
    
    // Flatten all wards from all districts
    const wards: Ward[] = [];
    if (province.districts) {
      for (const district of province.districts) {
        if (district.wards) {
          wards.push(...district.wards);
        }
      }
    }
    
    return wards;
  },
};
