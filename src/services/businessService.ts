export interface BusinessProfile {
  businessName: string;
  taxCode: string;
  businessType: string;
  mainBusinessLine: string;
  licenseDate: string;
  provinceRegistration: string;
  wardRegistration: string;
  addressRegistration: string;
  foreignName: string;
  email: string;
  phone: string;
  provinceOperation: string;
  wardOperation: string;
  addressOperation: string;
  representativeName: string;
  representativePhone: string;
}

export const businessService = {
  createBusiness: async (data: BusinessProfile): Promise<void> => {
    // POST /api/business
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Business created:", data);
        resolve();
      }, 500);
    });
  }
};
