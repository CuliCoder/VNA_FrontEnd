"use client";

import { useState, useEffect } from "react";
import { Province, Ward } from "@/types/address";
import { provincesService } from "@/services/provincesService";

export function useAddress(
  defaultProvinceCode?: number,
  defaultWardCode?: number,
) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | "">(
    defaultProvinceCode ?? "",
  );
  const [selectedWard, setSelectedWard] = useState<number | "">(
    defaultWardCode ?? "",
  );
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    provincesService
      .getProvinces()
      .then(setProvinces)
      .catch(console.error)
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!selectedProvince) {
      setWards([]);
      setSelectedWard("");
      return;
    }
    setLoadingWards(true);
    provincesService
      .getWards(selectedProvince)
      .then(setWards)
      .catch(console.error)
      .finally(() => setLoadingWards(false));
  }, [selectedProvince]);

  const handleProvinceChange = (code: number | "") => {
    setSelectedProvince(code);
    setSelectedWard("");
  };

  return {
    provinces,
    wards,
    selectedProvince,
    selectedWard,
    loadingProvinces,
    loadingWards,
    handleProvinceChange,
    setSelectedWard,
    setSelectedProvince,
  };
}
