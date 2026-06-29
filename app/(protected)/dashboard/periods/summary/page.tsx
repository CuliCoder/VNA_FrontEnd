"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { departmentService } from "@/services/departmentService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/common";

const fmt = (v: any) => {
  const n = Number(v);
  return isNaN(n) || n === 0 ? "0" : n.toLocaleString("vi-VN");
};

const fmtRate = (v: any) => {
  if (v === undefined || v === null || v === "") return "0.00";
  const n = Number(v);
  return isNaN(n) ? "0.00" : Number(n).toFixed(2);
};

const TH = ({ children, className = "", ...props }: any) => (
  <th
    className={`border border-gray-300 bg-gray-100 px-1 py-1 text-[10px] font-semibold text-center align-middle leading-4 ${className}`}
    {...props}
  >
    {children}
  </th>
);

const TD = ({ children, className = "", ...props }: any) => (
  <td
    className={`border border-gray-200 px-1 py-1 text-[11px] text-center align-middle ${className}`}
    {...props}
  >
    {children}
  </td>
);

// ─── Section I: Thông tin tổng quan ─────────────────────────────────────────
function SectionITable({ rows }: { rows: any[] }) {
  return (
    <div className="rounded-md border border-gray-300 overflow-hidden">
      <table className="w-full border-collapse text-[11px] text-gray-700">
        <thead className="bg-gray-100">
          {/* Row 1 */}
          <tr>
            <TH rowSpan={3} className="w-[180px]">
              Loại hình cơ sở
            </TH>

            <TH rowSpan={3} className="w-[45px]">
              Mã số
            </TH>

            <TH colSpan={2}>Cơ sở</TH>

            <TH colSpan={3}>Lực lượng lao động</TH>

            <TH colSpan={3}>Tổng số tai nạn lao động</TH>

            <TH colSpan={2}>Tần suất tai nạn lao động</TH>

            <TH rowSpan={3} className="w-[80px]">
              Ghi chú
            </TH>
          </tr>

          {/* Row 2 */}
          <tr>
            <TH rowSpan={2} className="w-[55px]">
              Tổng số
            </TH>

            <TH rowSpan={2} className="w-[60px]">
              Số cơ sở
              <br />
              tham gia
            </TH>

            <TH rowSpan={2} className="w-[60px]">
              Tổng số
              <br />
              lao động
            </TH>

            <TH rowSpan={2} className="w-[65px]">
              Số LĐ của CS
              <br />
              tham gia BC
            </TH>

            <TH rowSpan={2} className="w-[55px]">
              Số lao động
              <br />
              nữ
            </TH>

            <TH colSpan={3}>Số người bị TNLĐ</TH>

            <TH rowSpan={2} className="w-[55px]">
              KTNLĐ
            </TH>

            <TH rowSpan={2} className="w-[55px]">
              KChết
            </TH>
          </tr>

          {/* Row 3 */}
          <tr>
            <TH className="w-[55px]">
              Tổng số
            </TH>

            <TH className="w-[55px]">
              Số người
              <br />
              chết
            </TH>

            <TH className="w-[65px]">
              Người bị
              <br />
              thương nặng
            </TH>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => {
            const isTotal = row.stt === 0 || idx === 0;

            return (
              <tr
                key={idx}
                className={
                  isTotal
                    ? "bg-blue-50 font-semibold"
                    : idx % 2 === 0
                      ? "bg-white hover:bg-gray-50"
                      : "bg-gray-50 hover:bg-gray-100"
                }
              >
                <TD className="text-left font-medium">
                  {row.loaiHinh ?? row.name ?? row.businessType ?? ""}
                </TD>

                <TD>{row.maSo ?? row.code ?? ""}</TD>

                <TD>{fmt(row.tongSoCoSo ?? row.establishments)}</TD>

                <TD>
                  {fmt(
                    row.soCoSoThamGia ??
                    row.participatingEstablishments
                  )}
                </TD>

                <TD>{fmt(row.tongSoLaoDong ?? row.totalEmployees)}</TD>

                <TD>
                  {fmt(
                    row.soLaoDongThamGia ??
                    row.reportingEmployees
                  )}
                </TD>

                <TD>{fmt(row.soLaoDongNu ?? row.femaleEmployees)}</TD>

                <TD className="font-semibold">
                  {fmt(row.taiNanTongSo ?? row.totalVictims)}
                </TD>

                <TD>
                  {fmt(row.taiNanNguoiChet ?? row.deathCount)}
                </TD>

                <TD>
                  {fmt(
                    row.taiNanThuongNang ??
                    row.severelyInjuredCount
                  )}
                </TD>

                <TD>
                  {fmtRate(
                    row.ktnld ??
                    row.accidentFrequencyRate
                  )}
                </TD>

                <TD>
                  {fmtRate(
                    row.kChet ??
                    row.deathFrequencyRate
                  )}
                </TD>

                <TD className="text-left">
                  {row.ghiChu ?? row.note ?? ""}
                </TD>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Section II: Phân loại TNLĐ ─────────────────────────────────────────────
function SectionIITable({ rows }: { rows: any[] }) {
  return (
    <div className="rounded-md border border-gray-300 overflow-hidden">
      <table className="w-full border-collapse text-[11px] text-gray-700">
        <thead className="bg-gray-100">
          {/* Row 1 */}
          <tr>
            <TH rowSpan={3} className="w-[180px]">
              Tên chỉ tiêu thống kê
            </TH>


            <TH rowSpan={3} className="w-[45px]">
              Mã số
            </TH>

            <TH colSpan={7}>
              Phân loại TNLĐ theo mức độ thương tật
            </TH>

            <TH rowSpan={3} className="w-[55px]">
              Tổng số
              <br />
              ngày nghỉ
              <br />
              vì TNLĐ
            </TH>

            <TH colSpan={5}>
              Tổng số tiền chi vì TNLĐ
            </TH>
          </tr>

          {/* Row 2 */}
          <tr>
            <TH colSpan={3}>
              Số vụ TNLĐ
            </TH>

            <TH colSpan={4}>
              Số người bị nạn
            </TH>

            <TH rowSpan={2} className="w-[60px]">
              Tổng số tiền
            </TH>

            <TH rowSpan={2} className="w-[55px]">
              Y tế
            </TH>

            <TH rowSpan={2} className="w-[65px]">
              Trả lương theo thời gian điều trị
            </TH>

            <TH rowSpan={2} className="w-[70px]">
              Bồi thường/
              Trợ cấp
            </TH>

            <TH rowSpan={2} className="w-[65px]">
              Thiệt hại
              <br />
              tài sản (1.000đ)
            </TH>
          </tr>

          {/* Row 3 */}
          <tr>
            <TH className="w-[50px]">
              Tổng số
            </TH>

            <TH className="w-[55px]">
              số vụ có người chết
            </TH>

            <TH className="w-[60px]">
              Số vụ có từ 2 người bị nạn trở lên
            </TH>

            <TH className="w-[55px]">
              Tổng số
            </TH>

            <TH className="w-[55px]">
              Số LĐ nữ
            </TH>

            <TH className="w-[55px]">
              Số người bị chết
            </TH>

            <TH className="w-[60px]">
              Số người bị thương nặng
            </TH>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => {
            const isTotal = row.isTotal || row.stt === 0;


            return (
              <tr
                key={idx}
                className={
                  isTotal
                    ? "bg-blue-50 font-semibold"
                    : idx % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50"
                }
              >

                <>
                  {row.groupRowSpan > 0 && (
                    
                    <TD
                      rowSpan={row.groupRowSpan}
                      className="align-middle text-left font-semibold bg-gray-50 w-[180px]"
                    >
                      {row.groupLabel}
                    </TD>
                  )}

                </>

                {/* Mã */}
                <TD>{row.maDanhMuc}</TD>

                {/* Số vụ */}
                <TD>{fmt(row.soVu)}</TD>

                <TD>{fmt(row.soVuCoNguoiChet)}</TD>

                <TD>{fmt(row.soVuCoNhieuNguoiBiNan)}</TD>

                {/* Người bị nạn */}
                <TD>{fmt(row.soNguoiBiNan)}</TD>

                <TD>{fmt(row.soNguoiBiNanNu)}</TD>

                <TD>{fmt(row.soNguoiChet)}</TD>

                <TD>{fmt(row.soNguoiBiThuongNang)}</TD>

                {/* Ngày nghỉ */}
                <TD>{fmt(row.soNgayNghi)}</TD>

                {/* Chi phí */}
                <TD className="font-semibold">
                  {fmt(row.tongSoTien)}
                </TD>

                <TD>{fmt(row.yTe)}</TD>

                <TD>{fmt(row.traLuong)}</TD>

                <TD>{fmt(row.boiThuong)}</TD>

                <TD>{fmt(row.thietHaiTaiSan)}</TD>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
interface SummaryRow {
  stt: number;
  tenDanhMuc: string;
  maDanhMuc: string;
  nhomDanhMuc: string;
  soVu: number;
  soVuCoNguoiChet: number;
  soVuCoNhieuNguoiBiNan: number;
  soNguoiBiNan: number;
  soNguoiBiNanNu: number;
  soNguoiChet: number;
  soNguoiBiThuongNang: number;
  soNgayNghi: number;
  tongSoTien: number;
  yTe: number;
  traLuong: number;
  boiThuong: number;
  thietHaiTaiSan: number;
}

interface GroupHeaderRow {
  isGroupHeader: true;
  label: string;
}

type AccidentRow = SummaryRow &
  Partial<{
    isTotal: boolean;
    isGroupHeader: boolean;
    label: string;
  }>;

function SummaryReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const yearParam = searchParams.get("year");
  const provinceIdParam = searchParams.get("provinceId");
  const wardIdParam = searchParams.get("wardId");

  const year = yearParam ? Number(yearParam) : new Date().getFullYear();
  const provinceId = provinceIdParam ? Number(provinceIdParam) : undefined;
  const wardId = wardIdParam ? Number(wardIdParam) : undefined;

  const [generalData, setGeneralData] = useState<any>(null);
  const [accidentData, setAccidentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setGeneralData(null);
    setAccidentData(null);
    Promise.all([
      departmentService.getGeneralSummary({ year, provinceId, wardId }),
      departmentService.getAccidentSummary({ year, provinceId, wardId }),
    ])
      .then(([gen, acc]) => {
        setGeneralData(gen);
        setAccidentData(acc);
      })
      .catch(() => {
        toast({
          title: "Lỗi tải báo cáo tổng hợp",
          description: "Không thể lấy dữ liệu tổng hợp từ hệ thống.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [year, provinceId, wardId, toast]);

  const generalRows: any[] = Array.isArray(generalData?.summaryTable)
    ? generalData.summaryTable
    : Array.isArray(generalData)
      ? generalData
      : Array.isArray(generalData?.data)
        ? generalData.data
        : [];

  const rawRows = React.useMemo<SummaryRow[]>(() => {
    if (Array.isArray(accidentData?.summaryTable)) {
      return accidentData.summaryTable;
    }

    if (Array.isArray(accidentData?.accidentTable)) {
      return accidentData.accidentTable;
    }

    if (Array.isArray(accidentData)) {
      return accidentData;
    }

    if (Array.isArray(accidentData?.data)) {
      return accidentData.data;
    }

    return [];
  }, [accidentData]);

  const accidentRows = React.useMemo<(AccidentRow | GroupHeaderRow)[]>(() => {
    if (!rawRows.length) return [];

    const result: (AccidentRow | GroupHeaderRow)[] = [];

    // Dòng tổng số
    const total = rawRows.find(
      (row) => row.nhomDanhMuc === "Tổng số"
    );

    if (total) {
      result.push({
        ...total,
        isTotal: true,
      });
    }

    // Lấy danh sách nhóm theo đúng thứ tự BE trả về
    const groups = Array.from(
      new Set(
        rawRows
          .map((row) => row.nhomDanhMuc)
          .filter(
            (group): group is string =>
              !!group && group !== "Tổng số"
          )
      )
    );

    groups.forEach((group) => {
  const items = rawRows.filter(
    (row) => row.nhomDanhMuc === group
  );

  items.forEach((item, index) => {
    result.push({
      ...item,
      groupLabel: index === 0 ? group : "",
      groupRowSpan: index === 0 ? items.length : 0,
    });
  });
});

    return result;
  }, [rawRows]);

  const pageTitle =
    generalData?.title ??
    `Báo cáo tổng hợp tình hình tai nạn lao động năm ${year}`;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header bar */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-800 shrink-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
        <h1 className="text-base font-semibold text-gray-800 leading-snug">
          {pageTitle}
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="p-6 overflow-y-auto flex-1">
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Đang tải dữ liệu tổng hợp từ hệ thống...
          </div>
        ) : (
          <div className="space-y-10">
            {/* ── Section I ── */}
            <section>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  I
                </span>
                Thông tin tổng quan
              </h3>
              {generalRows.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm border border-gray-200 rounded-lg">
                  Không có dữ liệu tổng quan
                </div>
              ) : (
                <SectionITable rows={generalRows} />
              )}
            </section>

            {/* ── Section II ── */}
            <section>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  II
                </span>
                Phân loại tai nạn lao động
              </h3>
              {accidentRows.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm border border-gray-200 rounded-lg">
                  Không có dữ liệu phân loại tai nạn lao động
                </div>
              ) : (
                <SectionIITable rows={accidentRows} />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SummaryReportPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-gray-500">Đang tải...</div>
      }
    >
      <SummaryReportContent />
    </React.Suspense>
  );
}
