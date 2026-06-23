"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { reportService } from "@/services/reportService";
import { toast } from "sonner";
import { ChevronRight, Save, Printer } from "lucide-react";
import AccidentSummaryForm, { AccidentSummaryData, defaultAccidentSummaryData } from "../_components/AccidentSummaryForm";
import AccidentDetailForm, { AccidentDetailItem, defaultAccidentDetailItem } from "../_components/AccidentDetailForm";
import AccidentOverview from "../_components/AccidentOverview";
import { formatCurrency, parseCurrency } from "@/utils/format";
import { Modal } from "@/components/common/Modal/Modal";

export default function ReportDeclarationPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  
  // Tabs/Sections
  const [currentSection, setCurrentSection] = useState("company_info");
  const [accident1Tab, setAccident1Tab] = useState("summary");
  
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  const SECTION_ORDER = ["company_info", "accident_1", "accident_2", "overview"];

  // Form State for Company Info
  const [employeeTotal, setEmployeeTotal] = useState("");
  const [femaleTotal, setFemaleTotal] = useState("");
  const [salaryFund, setSalaryFund] = useState("");

  const [companyInfoErrors, setCompanyInfoErrors] = useState<any>({});

  // Form State for Accident Data
  const [accident1SummaryData, setAccident1SummaryData] = useState<AccidentSummaryData>(defaultAccidentSummaryData);
  const [accident1SummaryErrors, setAccident1SummaryErrors] = useState<Partial<Record<keyof AccidentSummaryData, string>>>({});

  const [accident1DetailData, setAccident1DetailData] = useState<AccidentDetailItem[]>([]);
  const [accident1DetailErrors, setAccident1DetailErrors] = useState<any[]>([]);

  // Sync details array length with totalAccidents
  useEffect(() => {
    setAccident1DetailData(prev => {
      const numAccidents = Number(accident1SummaryData.totalAccidents) || 0;
      if (prev.length === numAccidents) return prev;
      if (numAccidents > prev.length) {
        const newItems = Array.from({ length: numAccidents - prev.length }).map(() => ({
          ...defaultAccidentDetailItem,
          summary: { ...defaultAccidentSummaryData }
        }));
        return [...prev, ...newItems];
      }
      return prev.slice(0, numAccidents);
    });
  }, [accident1SummaryData.totalAccidents]);
  const [accident2SummaryData, setAccident2SummaryData] = useState<AccidentSummaryData>(defaultAccidentSummaryData);
  const [accident2SummaryErrors, setAccident2SummaryErrors] = useState<Partial<Record<keyof AccidentSummaryData, string>>>({});

  const enterpriseProfile = user?.enterpriseProfile as any;

  const isReadOnly = reportData?.status === "SUBMITTED" || searchParams.get("mode") === "view";

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await reportService.getReportDetails(Number(id));
        setReportData(data);
        
        setEmployeeTotal(data.companyEmployeeTotal?.toString() || "");
        setFemaleTotal(data.femaleEmployeeTotal?.toString() || "");
        setSalaryFund(data.salaryFund?.toString() || "");

        const mapPayloadToSummary = (payload: any): AccidentSummaryData => {
          if (!payload) return defaultAccidentSummaryData;
          return {
            totalAccidents: payload.accidentCount != null ? payload.accidentCount.toString() : "",
            fatalAccidents: payload.fatalAccidentCount != null ? payload.fatalAccidentCount.toString() : "",
            multipleVictimsAccidents: payload.multiVictimAccidentCount != null ? payload.multiVictimAccidentCount.toString() : "",
            totalVictims: payload.victimCount != null ? payload.victimCount.toString() : "",
            femaleVictims: payload.femaleVictimCount != null ? payload.femaleVictimCount.toString() : "",
            deadVictims: payload.deathCount != null ? payload.deathCount.toString() : "",
            severeInjuredVictims: payload.severelyInjuredCount != null ? payload.severelyInjuredCount.toString() : "",
            unmanagedVictims: payload.unmanagedCauseVictimCount != null ? payload.unmanagedCauseVictimCount.toString() : "",
            unmanagedFemaleVictims: payload.unmanagedCauseFemaleVictimCount != null ? payload.unmanagedCauseFemaleVictimCount.toString() : "",
            unmanagedDeadVictims: payload.unmanagedCauseDeathCount != null ? payload.unmanagedCauseDeathCount.toString() : "",
            unmanagedSevereInjuredVictims: payload.unmanagedCauseSeverelyInjuredCount != null ? payload.unmanagedCauseSeverelyInjuredCount.toString() : "",
            medicalCost: payload.medicalCost != null ? payload.medicalCost.toString() : "",
            salaryCost: payload.salaryCompensation != null ? payload.salaryCompensation.toString() : "",
            compensationCost: payload.compensationCost != null ? payload.compensationCost.toString() : "",
            totalCost: payload.totalCost != null ? payload.totalCost.toString() : "",
            leaveDays: payload.daysLost != null ? payload.daysLost.toString() : "",
            propertyDamage: payload.assetDamage != null ? payload.assetDamage.toString() : "",
          };
        };

        const accidentSection = data.sections?.find((s: any) => s.sectionType === "ACCIDENT");
        const allowanceSection = data.sections?.find((s: any) => s.sectionType === "ALLOWANCE");

        if (accidentSection) {
          setAccident1SummaryData(mapPayloadToSummary(accidentSection));
          if (accidentSection.accidentCases && Array.isArray(accidentSection.accidentCases)) {
            setAccident1DetailData(accidentSection.accidentCases.map((caseItem: any) => ({
              cause: caseItem.accidentCauseId != null ? caseItem.accidentCauseId.toString() : "",
              factor: caseItem.injuryFactorId != null ? caseItem.injuryFactorId.toString() : "",
              job: caseItem.occupationId != null ? caseItem.occupationId.toString() : "",
              summary: mapPayloadToSummary(caseItem)
            })));
          }
        }

        if (allowanceSection) {
          setAccident2SummaryData(mapPayloadToSummary(allowanceSection));
        }
        
        if (data.status === "SUBMITTED" || searchParams.get("mode") === "view") {
          setCurrentSection("overview");
        }
      } catch (error) {
        toast.error("Không thể tải thông tin báo cáo");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, searchParams]);

  const handleSave = async (silent = false) => {
    if (!id) return false;
    
    try {
      const num = (val: string) => Number(val) || 0;

      const mapSummaryToPayload = (summary: AccidentSummaryData, details: AccidentDetailItem[] = []) => ({
        accidentCount: num(summary.totalAccidents),
        fatalAccidentCount: num(summary.fatalAccidents),
        multiVictimAccidentCount: num(summary.multipleVictimsAccidents),
        victimCount: num(summary.totalVictims),
        unmanagedCauseVictimCount: num(summary.unmanagedVictims),
        femaleVictimCount: num(summary.femaleVictims),
        unmanagedCauseFemaleVictimCount: num(summary.unmanagedFemaleVictims),
        deathCount: num(summary.deadVictims),
        unmanagedCauseDeathCount: num(summary.unmanagedDeadVictims),
        severelyInjuredCount: num(summary.severeInjuredVictims),
        unmanagedCauseSeverelyInjuredCount: num(summary.unmanagedSevereInjuredVictims),
        medicalCost: num(summary.medicalCost),
        salaryCompensation: num(summary.salaryCost),
        compensationCost: num(summary.compensationCost),
        assetDamage: num(summary.propertyDamage),
        daysLost: num(summary.leaveDays),
        accidentCases: details.map(d => ({
          accidentCauseId: num(d.cause),
          injuryFactorId: num(d.factor),
          occupationId: num(d.job),
          accidentCount: num(d.summary.totalAccidents),
          fatalAccidentCount: num(d.summary.fatalAccidents),
          multiVictimAccidentCount: num(d.summary.multipleVictimsAccidents),
          victimCount: num(d.summary.totalVictims),
          unmanagedCauseVictimCount: num(d.summary.unmanagedVictims),
          femaleVictimCount: num(d.summary.femaleVictims),
          unmanagedCauseFemaleVictimCount: num(d.summary.unmanagedFemaleVictims),
          deathCount: num(d.summary.deadVictims),
          unmanagedCauseDeathCount: num(d.summary.unmanagedDeadVictims),
          severelyInjuredCount: num(d.summary.severeInjuredVictims),
          unmanagedCauseSeverelyInjuredCount: num(d.summary.unmanagedSevereInjuredVictims),
          medicalCost: num(d.summary.medicalCost),
          salaryCompensation: num(d.summary.salaryCost),
          compensationCost: num(d.summary.compensationCost),
          assetDamage: num(d.summary.propertyDamage),
          daysLost: num(d.summary.leaveDays)
        }))
      });

      const payload = {
        companyEmployeeTotal: num(employeeTotal),
        femaleEmployeeTotal: num(femaleTotal),
        salaryFund: num(salaryFund),
        accident: mapSummaryToPayload(accident1SummaryData, accident1DetailData),
        allowance: mapSummaryToPayload(accident2SummaryData, [])
      };

      const data = await reportService.updateReport(Number(id), payload);
      setReportData(data); // Cập nhật state với dữ liệu mới từ server

      if (!silent) {
        toast.success("Đã lưu báo cáo thành công");
        router.push("/dashboard/accidents");
      }
      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Không thể lưu báo cáo";
      toast.error(errorMessage);
      return false;
    }
  };

  const handleUploadFile = async (file: File) => {
    if (!id) return;
    try {
      const res = await reportService.uploadReportFile(Number(id), file);
      toast.success("Đã tải lên file báo cáo");
      setReportData((prev: any) => ({
        ...prev,
        attachedFileName: res.fileName,
        attachedFilePath: res.filePath
      }));
    } catch (error: any) {
      const errorMessage = error.message || "Không thể tải lên file báo cáo";
      toast.error(errorMessage);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportData?.attachedFilePath) {
      toast.error("Vui lòng đính kèm báo cáo TNLĐ có dấu mộc công ty trước khi gửi");
      return;
    }
    
    try {
      await reportService.submitReport(Number(id));
      toast.success("Đã gửi báo cáo thành công");
      router.push("/dashboard/accidents");
    } catch (error: any) {
      const errorMessage = error.message || "Không thể gửi báo cáo";
      toast.error(errorMessage);
    }
  };

  const validateCompanyInfo = () => {
    const errs: any = {};
    if (!employeeTotal) errs.employeeTotal = "Vui lòng nhập tổng số lao động";
    if (!femaleTotal) errs.femaleTotal = "Vui lòng nhập số lao động nữ";
    if (!salaryFund) errs.salaryFund = "Vui lòng nhập tổng quỹ lương";
    
    if (employeeTotal && femaleTotal && Number(employeeTotal) < Number(femaleTotal)) {
      errs.femaleTotal = "Số lao động nữ không được lớn hơn tổng số lao động";
    }
    
    setCompanyInfoErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAccidentSummary = (data: AccidentSummaryData) => {
    const errs: Partial<Record<keyof AccidentSummaryData, string>> = {};
    
    const requiredFields: (keyof AccidentSummaryData)[] = [
      "totalAccidents", "fatalAccidents", "multipleVictimsAccidents",
      "totalVictims", "femaleVictims", "deadVictims", "severeInjuredVictims",
      "unmanagedVictims", "unmanagedFemaleVictims", "unmanagedDeadVictims", "unmanagedSevereInjuredVictims",
      "medicalCost", "salaryCost", "compensationCost", "totalCost", "leaveDays"
    ];
    
    for (const field of requiredFields) {
      if (!data[field]) errs[field] = "Vui lòng nhập trường này";
    }
    
    const num = (val: string) => Number(val) || 0;
    
    if (num(data.totalAccidents) < num(data.fatalAccidents)) {
      errs.fatalAccidents = "Không được lớn hơn tổng số vụ";
    }
    if (num(data.totalAccidents) < num(data.multipleVictimsAccidents)) {
      errs.multipleVictimsAccidents = "Không được lớn hơn tổng số vụ";
    }
    
    if (num(data.totalVictims) < num(data.femaleVictims)) {
      errs.femaleVictims = "Không được lớn hơn tổng số người bị nạn";
    }
    if (num(data.totalVictims) < num(data.deadVictims)) {
      errs.deadVictims = "Không được lớn hơn tổng số người bị nạn";
    }
    if (num(data.totalVictims) < num(data.severeInjuredVictims)) {
      errs.severeInjuredVictims = "Không được lớn hơn tổng số người bị nạn";
    }
    if (num(data.totalVictims) < (num(data.deadVictims) + num(data.severeInjuredVictims))) {
      errs.totalVictims = "Phải >= tổng số người chết và bị thương nặng";
    }
    
    if (num(data.unmanagedVictims) < num(data.unmanagedFemaleVictims)) {
      errs.unmanagedFemaleVictims = "Không được lớn hơn tổng số (không QL)";
    }
    if (num(data.unmanagedVictims) < num(data.unmanagedDeadVictims)) {
      errs.unmanagedDeadVictims = "Không được lớn hơn tổng số (không QL)";
    }
    if (num(data.unmanagedVictims) < num(data.unmanagedSevereInjuredVictims)) {
      errs.unmanagedSevereInjuredVictims = "Không được lớn hơn tổng số (không QL)";
    }
    if (num(data.unmanagedVictims) < (num(data.unmanagedDeadVictims) + num(data.unmanagedSevereInjuredVictims))) {
      errs.unmanagedVictims = "Phải >= tổng người chết và thương nặng (không QL)";
    }
    
    if (num(data.totalCost) < (num(data.medicalCost) + num(data.salaryCost) + num(data.compensationCost))) {
      errs.totalCost = "Phải >= tổng các chi phí thành phần";
    }
    
    return errs;
  };

  const handleSectionChange = async (newSection: string) => {
    if (newSection === "overview" && currentSection !== "overview") {
      if (!validateCompanyInfo()) {
        toast.error("Vui lòng nhập đầy đủ và chính xác thông tin doanh nghiệp");
        if (currentSection !== "company_info") setCurrentSection("company_info");
        return;
      }

      const summary1Errs = validateAccidentSummary(accident1SummaryData);
      const detailErrsList: any[] = [];
      let hasDetailErrs = false;
      let sumDetailAccidents = 0;

      accident1DetailData.forEach((detail, index) => {
        sumDetailAccidents += Number(detail.summary.totalAccidents) || 0;
        const errs = validateAccidentSummary(detail.summary);
        detailErrsList[index] = errs;
        if (Object.keys(errs).length > 0) hasDetailErrs = true;
      });
      const isExceed = sumDetailAccidents > (Number(accident1SummaryData.totalAccidents) || 0);
      if (isExceed) {
        detailErrsList.forEach(errs => {
          if (!errs.totalAccidents) errs.totalAccidents = "Vượt quá tổng số vụ ở Tab 1";
        });
        hasDetailErrs = true;
      }
      
      setAccident1SummaryErrors(summary1Errs);
      setAccident1DetailErrors(detailErrsList);

      if (Object.keys(summary1Errs).length > 0 || hasDetailErrs) {
        if (isExceed) {
          toast.error("Tổng số vụ ở chi tiết các vụ tai nạn không được lớn hơn tổng số vụ ở Tab 1");
        }
        if (!isExceed || Object.keys(summary1Errs).length > 0 || detailErrsList.some(e => Object.keys(e).some(k => k !== 'totalAccidents' || e[k] !== "Vượt quá tổng số vụ ở Tab 1"))) {
          toast.error("Vui lòng nhập đầy đủ và chính xác thông tin các vụ tai nạn (Mục 1)");
        }
        setCurrentSection("accident_1");
        if (Object.keys(summary1Errs).length > 0) setAccident1Tab('summary');
        else if (hasDetailErrs) setAccident1Tab('details');
        return;
      }

      const summary2Errs = validateAccidentSummary(accident2SummaryData);
      setAccident2SummaryErrors(summary2Errs);
      if (Object.keys(summary2Errs).length > 0) {
        toast.error("Vui lòng nhập đầy đủ và chính xác thông tin các vụ tai nạn (Mục 2)");
        setCurrentSection("accident_2");
        return;
      }

      if (!isReadOnly) {
        const success = await handleSave(true);
        if (!success) return;
      }
    }
    
    setCurrentSection(newSection);
  };

  const handleNextSection = () => {
    if (isReadOnly) {
      proceedToNextSection();
      return;
    }

    if (currentSection === "company_info") {
      if (!validateCompanyInfo()) {
        toast.error("Vui lòng nhập đầy đủ và chính xác thông tin");
        return;
      }
    } else if (currentSection === "accident_1") {
      const summaryErrs = validateAccidentSummary(accident1SummaryData);
      
      const detailErrsList: any[] = [];
      let hasDetailErrs = false;
      let sumDetailAccidents = 0;

      accident1DetailData.forEach((detail, index) => {
        sumDetailAccidents += Number(detail.summary.totalAccidents) || 0;
        const errs = validateAccidentSummary(detail.summary);
        detailErrsList[index] = errs;
        if (Object.keys(errs).length > 0) {
          hasDetailErrs = true;
        }
      });
      const isExceed = sumDetailAccidents > (Number(accident1SummaryData.totalAccidents) || 0);
      if (isExceed) {
        detailErrsList.forEach(errs => {
          if (!errs.totalAccidents) errs.totalAccidents = "Vượt quá tổng số vụ ở Tab 1";
        });
        hasDetailErrs = true;
      }

      setAccident1SummaryErrors(summaryErrs);
      setAccident1DetailErrors(detailErrsList);

      if (Object.keys(summaryErrs).length > 0 || hasDetailErrs) {
        if (isExceed) {
          toast.error("Tổng số vụ ở chi tiết các vụ tai nạn không được lớn hơn tổng số vụ ở Tab 1");
        }
        if (!isExceed || Object.keys(summaryErrs).length > 0 || detailErrsList.some(e => Object.keys(e).some(k => k !== 'totalAccidents' || e[k] !== "Vượt quá tổng số vụ ở Tab 1"))) {
          toast.error("Vui lòng nhập đầy đủ và chính xác thông tin các vụ tai nạn");
        }
        if (Object.keys(summaryErrs).length > 0) setAccident1Tab('summary');
        else if (hasDetailErrs) setAccident1Tab('details');
        return;
      }
    } else if (currentSection === "accident_2") {
      const summaryErrs = validateAccidentSummary(accident2SummaryData);
      setAccident2SummaryErrors(summaryErrs);
      
      if (Object.keys(summaryErrs).length > 0) {
        toast.error("Vui lòng nhập đầy đủ và chính xác thông tin các vụ tai nạn");
        return;
      }
    }

    proceedToNextSection();
  };

  const proceedToNextSection = () => {
    const currentIndex = SECTION_ORDER.indexOf(currentSection);
    if (currentIndex < SECTION_ORDER.length - 1) {
      const nextSection = SECTION_ORDER[currentIndex + 1];
      if (nextSection === "overview") {
        handleSectionChange("overview");
      } else {
        setCurrentSection(nextSection);
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  if (!reportData) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy báo cáo</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <h1 className="text-lg font-semibold text-gray-800">Báo cáo định kỳ Tai nạn lao động</h1>
        <div className="flex items-center gap-3">
          <input 
            value={reportData.reportPeriod?.year || ""} 
            disabled 
            className="w-24 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-center shadow-sm"
          />
          <button 
            className="px-4 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            onClick={() => {
              if (currentSection === "overview" || isReadOnly) {
                router.back();
              } else {
                setShowCancelWarning(true);
              }
            }}
          >
            Huỷ bỏ
          </button>
          
          {currentSection !== "overview" ? (
            <>
              <button 
                className="px-4 py-2 border border-blue-200 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors flex items-center shadow-sm"
                onClick={handleNextSection}
              >
                Tiếp tục <ChevronRight className="w-4 h-4 ml-1" />
              </button>
              {!isReadOnly && (
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                  onClick={() => handleSave(false)}
                >
                  <Save className="w-4 h-4 mr-2" /> Lưu
                </button>
              )}
            </>
          ) : (
            <>
              <button 
                className="px-4 py-2 border border-blue-200 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors flex items-center shadow-sm"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-2" /> In báo cáo
              </button>
              {!isReadOnly && (
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                  onClick={handleSubmitReport}
                >
                  <Save className="w-4 h-4 mr-2" /> Gửi báo cáo
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative print:overflow-visible print:border-none print:shadow-none print:rounded-none">
        <div className="p-6 flex-1 overflow-auto print:overflow-visible print:p-0">
          {/* Section Selector */}
        {!isReadOnly && (
        <div className="mb-8 print:hidden">
          <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block font-medium">
            Chọn mục báo cáo
          </label>
          <select 
            className="w-full md:max-w-2xl border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={currentSection}
            onChange={(e) => handleSectionChange(e.target.value)}
          >
            <option value="company_info">Thông tin doanh nghiệp</option>
            <option value="accident_1">1. Tai nạn lao động</option>
            <option value="accident_2">2. Tai nạn lao động được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ</option>
            <option value="overview">Xem tổng quan báo cáo tai nạn lao động</option>
          </select>
        </div>
        )}

        {/* Section Content */}
        {currentSection === "company_info" && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800">1. Thông tin công ty</h2>
            <p className="text-red-500 text-sm font-medium">
              *** Lưu ý: nhập tổng quỹ lương 6 tháng khi khai báo TNLĐ 6 tháng hoặc tổng quỹ lương 12 tháng khi khai báo TNLĐ cả năm
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Disabled Enterprise Fields */}
              <div className="space-y-2 flex flex-col">
                <label className="text-gray-500 text-sm font-medium">Tên công ty</label>
                <input 
                  value={enterpriseProfile?.name || ""} 
                  disabled 
                  className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-500 cursor-not-allowed" 
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-gray-500 text-sm font-medium">Loại hình công ty</label>
                <input 
                  value={enterpriseProfile?.businessType?.name || ""} 
                  disabled 
                  className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-500 cursor-not-allowed" 
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-gray-500 text-sm font-medium">Ngành nghề kinh doanh</label>
                <input 
                  value={enterpriseProfile?.businessField?.name || ""} 
                  disabled 
                  className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-500 cursor-not-allowed" 
                />
              </div>

              {/* Editable Fields */}
              <div className="space-y-2 flex flex-col">
                <label className="text-gray-700 text-sm font-medium">
                  Tổng số lao động của cơ sở <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number"
                  min="0"
                  value={employeeTotal} 
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val.startsWith('-')) val = val.replace('-', '');
                    setEmployeeTotal(val);
                    if (companyInfoErrors.employeeTotal) setCompanyInfoErrors({...companyInfoErrors, employeeTotal: undefined});
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
                  }}
                  placeholder="Nhập tổng số lao động"
                  disabled={isReadOnly}
                  className={`border ${companyInfoErrors.employeeTotal ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isReadOnly ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}`}
                />
                {companyInfoErrors.employeeTotal && <p className="text-red-500 text-xs">{companyInfoErrors.employeeTotal}</p>}
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-gray-700 text-sm font-medium">
                  Tổng số lao động nữ <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number"
                  min="0"
                  value={femaleTotal} 
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val.startsWith('-')) val = val.replace('-', '');
                    setFemaleTotal(val);
                    if (companyInfoErrors.femaleTotal) setCompanyInfoErrors({...companyInfoErrors, femaleTotal: undefined});
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
                  }}
                  placeholder="Nhập số lao động nữ"
                  disabled={isReadOnly}
                  className={`border ${companyInfoErrors.femaleTotal ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isReadOnly ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}`}
                />
                {companyInfoErrors.femaleTotal && <p className="text-red-500 text-xs">{companyInfoErrors.femaleTotal}</p>}
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-gray-700 text-sm font-medium">
                  Tổng quỹ lương <span className="text-red-500">*</span>
                </label>
                <div className="relative flex">
                  <input 
                    type="text"
                    value={formatCurrency(salaryFund)} 
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.startsWith('-')) val = val.replace('-', '');
                      setSalaryFund(parseCurrency(val));
                      if (companyInfoErrors.salaryFund) setCompanyInfoErrors({...companyInfoErrors, salaryFund: undefined});
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
                    }}
                    placeholder="Nhập tổng quỹ lương"
                    disabled={isReadOnly}
                    className={`border ${companyInfoErrors.salaryFund ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md px-3 py-2 pr-16 text-sm focus:outline-none focus:ring-2 flex-1 ${isReadOnly ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                    (1.000đ)
                  </span>
                </div>
                {companyInfoErrors.salaryFund && <p className="text-red-500 text-xs">{companyInfoErrors.salaryFund}</p>}
              </div>
            </div>
          </div>
        )}

        {currentSection === "accident_1" && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800">**** Doanh nghiệp xảy ra tai nạn lao động vui lòng nhập theo từng bước</h2>
            
            {/* Tabs for accident 1 */}
            <div className="flex border-b border-gray-200">
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 ${accident1Tab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setAccident1Tab('summary')}
              >
                (1) Tổng số vụ tai nạn lao động
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 ${accident1Tab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setAccident1Tab('details')}
              >
                (2) Chi tiết các vụ tai nạn lao động
              </button>
            </div>

            <div className="pt-4">
              {accident1Tab === 'summary' && (
                <AccidentSummaryForm 
                  isReadOnly={isReadOnly} 
                  data={accident1SummaryData}
                  onChange={(f, v) => setAccident1SummaryData(prev => ({...prev, [f]: v}))}
                  errors={accident1SummaryErrors}
                />
              )}
              {accident1Tab === 'details' && (
                <AccidentDetailForm 
                  isReadOnly={isReadOnly} 
                  totalAccidents={Number(accident1SummaryData.totalAccidents) || 0}
                  data={accident1DetailData}
                  onChange={(index, field, value, isSummaryField) => {
                    setAccident1DetailData(prevData => {
                      const newData = [...prevData];
                      if (isSummaryField) {
                        newData[index] = {
                          ...newData[index],
                          summary: {
                            ...newData[index].summary,
                            [field]: value
                          }
                        };
                      } else {
                        newData[index] = {
                          ...newData[index],
                          [field]: value
                        };
                      }
                      return newData;
                    });
                  }}
                  errors={accident1DetailErrors}
                />
              )}
            </div>
          </div>
        )}

        {currentSection === "accident_2" && (
          <div className="space-y-6">
            <AccidentSummaryForm 
              isReadOnly={isReadOnly} 
              data={accident2SummaryData}
              onChange={(f, v) => setAccident2SummaryData(prev => ({...prev, [f]: v}))}
              errors={accident2SummaryErrors}
            />
          </div>
        )}

        {currentSection === "overview" && (
          <AccidentOverview 
            reportData={reportData}
            accident1SummaryData={accident1SummaryData}
            accident1DetailData={accident1DetailData}
            accident2SummaryData={accident2SummaryData}
            enterpriseProfile={enterpriseProfile}
            onUploadFile={handleUploadFile}
            isReadOnly={isReadOnly}
          />
        )}
        </div>
      </div>
      {/* Cancel Warning Popup */}
      <Modal
        open={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        title="Cảnh báo"
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button
              className="px-5 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setShowCancelWarning(false)}
            >
              Huỷ bỏ
            </button>
            <button
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              onClick={() => router.back()}
            >
              Đồng ý
            </button>
          </div>
        }
      >
        <div className="text-center text-gray-700 py-4">
          <p className="text-[15px]">Dữ liệu báo cáo đã nhập sẽ không được lưu lại</p>
        </div>
      </Modal>
    </div>
  );
}
