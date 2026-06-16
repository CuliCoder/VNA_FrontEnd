// business.mapper.ts
import type { BusinessFormValues, ReviewData } from "./BusinessForm";
import type { BusinessProfileRequest } from "@/services/businessService";

export function mapFormToBusinessRequest(
  data: BusinessFormValues,
  documents: any[]
): BusinessProfileRequest {
  return {
    name: data.name,
    taxCode: data.taxCode,

    licenseNumber: data.licenseNumber || undefined,
    licenseIssueDate: data.licenseDate || undefined,

    businessTypeId: Number(data.businessType),
    businessFieldId: Number(data.mainBusinessLine),

    provinceId: Number(data.provinceRegistration),
    wardId: Number(data.wardRegistration),
    registeredAddress: data.addressRegistration || "",

    provinceIdActivity: data.provinceOperation
      ? Number(data.provinceOperation)
      : undefined,

    wardIdActivity: data.wardOperation
      ? Number(data.wardOperation)
      : undefined,

    operatingAddress: data.addressOperation || "",

    englishName: data.foreignName || undefined,

    email: data.email,
    officePhone: data.phone || undefined,

    representativeName: data.representativeName || undefined,
    representativePhone: data.representativePhone || undefined,

    documents: documents as any[] | undefined,
  };
}

export function mapFormToReviewData(
  data: BusinessFormValues,
  documents: any[]
): ReviewData {
  return {
    name: data.name,
    taxCode: data.taxCode,

    licenseNumber: data.licenseNumber,
    licenseDate: data.licenseDate,

    businessTypeId: Number(data.businessType),
    businessFieldId: Number(data.mainBusinessLine),

    provinceId: Number(data.provinceRegistration),
    wardId: Number(data.wardRegistration),
    addressRegistration: data.addressRegistration || "",

    provinceIdActivity: data.provinceOperation
      ? Number(data.provinceOperation)
      : undefined,

    wardIdActivity: data.wardOperation ? Number(data.wardOperation) : undefined,

    operatingAddress: data.addressOperation || "",

    foreignName: data.foreignName || "",

    email: data.email,
    officePhone: data.phone || "",

    representativeName: data.representativeName || "",
    representativePhone: data.representativePhone || "",
    documents: documents as any[] | undefined,
    // For the review component we also expose `files` for compatibility with BusinessReview
    documents: documents as any[] | undefined,
  };
}

export function mapReviewToBusinessRequest(
  data: ReviewData
): BusinessProfileRequest {
  return {
    name: data.name,
    taxCode: data.taxCode,

    licenseNumber: data.licenseNumber || undefined,
    licenseIssueDate: data.licenseDate || undefined,

    businessTypeId: data.businessTypeId || 0,
    businessFieldId: data.businessFieldId || 0,

    provinceId: data.provinceId || 0,
    wardId: data.wardId || 0,
    registeredAddress: data.addressRegistration || "",

    provinceIdActivity: data.provinceIdActivity,
    wardIdActivity: data.wardIdActivity,
    operatingAddress: data.operatingAddress || "",

    englishName: data.foreignName || undefined,

    email: data.email,
    officePhone: data.officePhone || undefined,

    representativeName: data.representativeName || undefined,
    representativePhone: data.representativePhone || undefined,

    documents: data.documents as any[] | undefined,
  };
}