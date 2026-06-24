import React from 'react';
import { useReportCategories } from '@/hooks/useReportCategories';

interface AccidentOverviewProps {
  reportData: any;
  accident1SummaryData: any;
  accident1DetailData?: any[];
  accident2SummaryData: any;
  enterpriseProfile: any;
  onUploadFile?: (file: File) => Promise<void>;
  isReadOnly?: boolean;
}

export default function AccidentOverview({
  reportData,
  accident1SummaryData,
  accident1DetailData = [],
  accident2SummaryData,
  enterpriseProfile,
  onUploadFile,
  isReadOnly
}: AccidentOverviewProps) {
  const { categories, loading } = useReportCategories();
  const [isUploading, setIsUploading] = React.useState(false);
  
  const reportPeriodStr = reportData?.reportPeriod?.year 
    ? (reportData.reportPeriod.period === '6_MONTHS' ? `6 tháng năm ${reportData.reportPeriod.year}` : `năm ${reportData.reportPeriod.year}`)
    : `6 tháng năm ${new Date().getFullYear()}`;

  const num = (v: any) => Number(v) || 0;

  const toRowData = (data: any) => [
    num(data?.totalAccidents),
    num(data?.fatalAccidents),
    num(data?.multipleVictimsAccidents),
    num(data?.totalVictims),
    num(data?.unmanagedVictims),
    num(data?.femaleVictims),
    num(data?.unmanagedFemaleVictims),
    num(data?.deadVictims),
    num(data?.unmanagedDeadVictims),
    num(data?.severeInjuredVictims),
    num(data?.unmanagedSevereInjuredVictims),
  ];

  const accident1Row = toRowData(accident1SummaryData);
  const accident2Row = toRowData(accident2SummaryData);
  const totalRow = accident1Row.map((v, i) => v + accident2Row[i]);

  const sumDetails = (filterFn: (item: any) => boolean) => {
    const filtered = accident1DetailData.filter(filterFn);
    let res = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    filtered.forEach(item => {
      const row = toRowData(item.summary);
      res = res.map((v, i) => v + row[i]);
    });
    return res;
  };

  const renderCategoryRows = (catList: any[], type: 'cause' | 'factor' | 'job') => {
    if (!catList || catList.length === 0) return null;
    
    // Group categories by parent if level 1 and 2 exist (for accident causes)
    const parents = catList.filter(c => !c.parentId);
    const children = catList.filter(c => c.parentId);

    if (parents.length > 0 && children.length > 0) {
      return parents.map(parent => {
        const parentChildren = children.filter(c => c.parentId === parent.id);
        const selectedChildren = parentChildren.filter(child => 
          accident1DetailData.some(item => String(item[type]) === String(child.id))
        );

        if (selectedChildren.length === 0) return null;

        return (
          <React.Fragment key={`parent-${parent.id}`}>
            <tr className="font-semibold bg-gray-50">
              <td colSpan={13} className="border border-gray-200 p-2 pl-6">{parent.name}</td>
            </tr>
            {selectedChildren.map(child => {
              const rowValues = sumDetails(item => String(item[type]) === String(child.id));
              return (
                <tr key={`child-${child.id}`} className="bg-white">
                  <td className="border border-gray-200 p-2 pl-8">{child.name}</td>
                  <td className="border border-gray-200 p-2 text-center">{child.id}</td>
                  {rowValues.map((v, i) => <td key={i} className="border border-gray-200 p-2 text-center">{v}</td>)}
                </tr>
              );
            })}
          </React.Fragment>
        );
      });
    }

    const selectedItems = catList.filter(item => 
      accident1DetailData.some(detail => String(detail[type]) === String(item.id))
    );

    return selectedItems.map(item => {
      const rowValues = sumDetails(detail => String(detail[type]) === String(item.id));
      return (
        <tr key={`${type}-${item.id}`} className="bg-white">
          <td className="border border-gray-200 p-2 pl-8">{item.name}</td>
          <td className="border border-gray-200 p-2 text-center">{item.id}</td>
          {rowValues.map((v, i) => <td key={i} className="border border-gray-200 p-2 text-center">{v}</td>)}
        </tr>
      );
    });
  };

  const formatMoney = (val: number) => {
    if (!val) return '0';
    return val.toLocaleString('vi-VN');
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
          Báo cáo tổng hợp tình hình tai nạn lao động - Kỳ báo cáo: {reportPeriodStr}
        </h2>
        
        <div className="flex items-center text-sm font-medium mb-6 print:hidden">
          <span className="text-red-500">***Vui lòng đính kèm báo cáo TNLĐ có dấu mộc công ty: </span>
          {!isReadOnly && (
            <label className={`text-blue-600 hover:underline mx-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              Tại đây
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !onUploadFile) return;
                  try {
                    setIsUploading(true);
                    await onUploadFile(file);
                  } finally {
                    setIsUploading(false);
                    e.target.value = '';
                  }
                }} 
                disabled={isUploading}
              />
            </label>
          )}
          {reportData?.attachedFilePath ? (
            <a href={reportData.attachedFilePath} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {reportData.attachedFileName || 'baocaoTNLD.pdf'}
            </a>
          ) : (
            <span className="text-gray-500 italic ml-2">Chưa có file đính kèm</span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto mb-8 border border-gray-200 rounded-sm">
        <table className="w-full text-xs text-left text-gray-700 border-collapse">
          <thead className="bg-gray-50 text-gray-700 text-center">
            <tr>
              <th rowSpan={4} className="border border-gray-200 p-2 align-middle font-semibold min-w-[300px]">Tên chỉ tiêu thống kê</th>
              <th rowSpan={4} className="border border-gray-200 p-2 align-middle font-semibold whitespace-nowrap">Mã số</th>
              <th colSpan={11} className="border border-gray-200 p-2 align-middle font-semibold">Phân loại TNLĐ theo mức độ thương tật</th>
            </tr>
            <tr>
              <th colSpan={3} className="border border-gray-200 p-2 align-middle font-semibold">Số vụ (Vụ)</th>
              <th colSpan={8} className="border border-gray-200 p-2 align-middle font-semibold">Số người bị nạn (Người)</th>
            </tr>
            <tr>
              <th rowSpan={2} className="border border-gray-200 p-2 align-middle font-semibold w-16">Tổng số</th>
              <th rowSpan={2} className="border border-gray-200 p-2 align-middle font-semibold w-16">Số vụ có<br/>người chết</th>
              <th rowSpan={2} className="border border-gray-200 p-2 align-middle font-semibold w-16">Số vụ có<br/>từ 2<br/>người bị<br/>nạn trở<br/>lên</th>
              <th colSpan={2} className="border border-gray-200 p-2 align-middle font-semibold">Tổng số</th>
              <th colSpan={2} className="border border-gray-200 p-2 align-middle font-semibold">Số LĐ nữ</th>
              <th colSpan={2} className="border border-gray-200 p-2 align-middle font-semibold">Số người bị chết</th>
              <th colSpan={2} className="border border-gray-200 p-2 align-middle font-semibold">Số người bị thương nặng</th>
            </tr>
            <tr>
              <th className="border border-gray-200 p-2 align-middle font-semibold w-16">Tổng số</th>
              <th className="border border-gray-200 p-2 align-middle font-semibold w-16">NN không<br/>thuộc<br/>quyền<br/>quản lý</th>
              <th className="border border-gray-200 p-2 align-middle font-semibold w-16">Tổng số</th>
              <th className="border border-gray-200 p-2 align-middle font-semibold w-16">NN không<br/>thuộc<br/>quyền<br/>quản lý</th>
              <th className="border border-gray-200 p-2 align-middle font-semibold w-16">Tổng số</th>
              <th className="border border-gray-200 p-2 align-middle font-semibold w-16">NN không<br/>thuộc<br/>quyền<br/>quản lý</th>
              <th className="border border-gray-200 p-2 align-middle font-semibold w-16">Tổng số</th>
              <th className="border border-gray-200 p-2 align-middle font-semibold w-16">NN không<br/>thuộc<br/>quyền<br/>quản lý</th>
            </tr>
          </thead>
          <tbody>
            <tr className="font-bold bg-white">
              <td className="border border-gray-200 p-3">1. Tai nạn lao động</td>
              <td className="border border-gray-200 p-3 text-center"></td>
              {accident1Row.map((v, i) => <td key={i} className="border border-gray-200 p-3 text-center">{v}</td>)}
            </tr>
            <tr className="font-bold bg-gray-50">
              <td colSpan={13} className="border border-gray-200 p-3">1.1 Phân theo nguyên nhân xảy ra TNLĐ</td>
            </tr>
            {!loading && categories?.accidentCauses && renderCategoryRows(categories.accidentCauses, 'cause')}

            <tr className="font-bold bg-gray-50">
              <td colSpan={13} className="border border-gray-200 p-3">1.2. Phân theo yếu tố gây chấn thương</td>
            </tr>
            {!loading && categories?.injuryFactors && renderCategoryRows(categories.injuryFactors, 'factor')}

            <tr className="font-bold bg-gray-50">
              <td colSpan={13} className="border border-gray-200 p-3">1.3 Phân theo nghề nghiệp</td>
            </tr>
            {!loading && categories?.occupations && renderCategoryRows(categories.occupations, 'job')}

            <tr className="font-bold bg-white">
              <td className="border border-gray-200 p-3">2. Tai nạn được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ</td>
              <td className="border border-gray-200 p-3 text-center">10</td>
              {accident2Row.map((v, i) => <td key={i} className="border border-gray-200 p-3 text-center">{v}</td>)}
            </tr>

            <tr className="font-bold bg-gray-50">
              <td colSpan={13} className="border border-gray-200 p-3">3. Tổng số</td>
            </tr>
            <tr className="font-bold bg-white">
              <td className="border border-gray-200 p-3">Tổng số (3=1+2)</td>
              <td className="border border-gray-200 p-3 text-center"></td>
              {totalRow.map((v, i) => <td key={i} className="border border-gray-200 p-3 text-center">{v}</td>)}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="font-bold text-gray-800 mb-2">II. Thiệt hại do tai nạn lao động</div>
      <div className="overflow-x-auto border border-gray-200 rounded-sm">
        <table className="w-full text-xs text-center text-gray-700 border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th rowSpan={3} className="border border-gray-200 p-3 align-middle font-semibold w-1/3">Tổng số ngày nghỉ vì tai nạn lao động (kể cả ngày nghỉ chế độ)</th>
              <th colSpan={4} className="border border-gray-200 p-3 align-middle font-semibold">Tổng chi phí vì TNLĐ (1.000đ)</th>
              <th rowSpan={3} className="border border-gray-200 p-3 align-middle font-semibold w-1/6">Thiệt hại tài sản<br/>(1.000đ)</th>
            </tr>
            <tr>
              <th rowSpan={2} className="border border-gray-200 p-2 align-middle font-semibold">Tổng số</th>
              <th colSpan={3} className="border border-gray-200 p-2 align-middle font-semibold">Khoảng chi cụ thể của cơ sở</th>
            </tr>
            <tr>
              <th className="border border-gray-200 p-2 align-middle font-semibold">Y tế</th>
              <th className="border border-gray-200 p-2 align-middle font-semibold">Trả lương trong thời gian điều trị</th>
              <th className="border border-gray-200 p-2 align-middle font-semibold">Bồi thường trợ cấp</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border border-gray-200 p-3">{num(accident1SummaryData?.leaveDays) + num(accident2SummaryData?.leaveDays)}</td>
              <td className="border border-gray-200 p-3">{formatMoney(num(accident1SummaryData?.totalCost) + num(accident2SummaryData?.totalCost))}</td>
              <td className="border border-gray-200 p-3">{formatMoney(num(accident1SummaryData?.medicalCost) + num(accident2SummaryData?.medicalCost))}</td>
              <td className="border border-gray-200 p-3">{formatMoney(num(accident1SummaryData?.salaryCost) + num(accident2SummaryData?.salaryCost))}</td>
              <td className="border border-gray-200 p-3">{formatMoney(num(accident1SummaryData?.compensationCost) + num(accident2SummaryData?.compensationCost))}</td>
              <td className="border border-gray-200 p-3">{formatMoney(num(accident1SummaryData?.propertyDamage) + num(accident2SummaryData?.propertyDamage))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
