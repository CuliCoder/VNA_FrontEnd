export const formatCurrency = (value: string | number): string => {
  if (value === undefined || value === null) return "";
  const strValue = String(value);
  const cleanValue = strValue.replace(/\./g, "");
  if (cleanValue === "") return "";
  if (isNaN(Number(cleanValue))) return strValue;
  return new Intl.NumberFormat("vi-VN").format(Number(cleanValue));
};

export const parseCurrency = (value: string): string => {
  if (!value) return "";
  return value.replace(/\./g, "");
};
