import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import AccidentSummaryForm, { AccidentSummaryData, defaultAccidentSummaryData } from './AccidentSummaryForm';
import { useReportCategories } from '@/hooks/useReportCategories';

export interface AccidentDetailItem {
  cause: string;
  factor: string;
  job: string;
  summary: AccidentSummaryData;
}

export const defaultAccidentDetailItem: AccidentDetailItem = {
  cause: "",
  factor: "",
  job: "",
  summary: defaultAccidentSummaryData
};

interface AccidentDetailFormProps {
  isReadOnly?: boolean;
  totalAccidents: number;
  data: AccidentDetailItem[];
  onChange: (index: number, field: string, value: any, isSummaryField?: boolean) => void;
  errors?: any[];
}

export default function AccidentDetailForm({ isReadOnly, totalAccidents, data = [], onChange, errors = [] }: AccidentDetailFormProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const { categories, loading } = useReportCategories();

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => ({ ...prev, [index]: prev[index] === undefined ? false : !prev[index] }));
  };

  if (totalAccidents <= 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {Array.from({ length: totalAccidents }).map((_, index) => {
        const itemData = data[index] || { ...defaultAccidentDetailItem, summary: { ...defaultAccidentSummaryData } };
        const itemErrors = errors[index] || {};
        const isExpanded = expandedItems[index] !== false; // default true

        return (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div 
              className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(index)}
            >
              <h3 className="font-semibold text-gray-800">Chi tiết vụ tai nạn số {index + 1}</h3>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </div>
            {isExpanded && (
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-medium">1. Phân theo nguyên nhân xảy ra TNLĐ</label>
                    <select 
                      className={`w-full border ${itemErrors.cause ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2`} 
                      disabled={isReadOnly || loading}
                      value={itemData.cause}
                      onChange={(e) => onChange(index, 'cause', e.target.value, false)}
                    >
                      <option value="">Chọn nguyên nhân...</option>
                      {categories?.accidentCauses?.map(c => (
                        <option key={c.id} value={c.id.toString()}>{c.name}</option>
                      ))}
                    </select>
                    {itemErrors.cause && <p className="text-red-500 text-xs mt-1">{itemErrors.cause}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-medium">2. Phân theo yếu tố gây chấn thương</label>
                    <select 
                      className={`w-full border ${itemErrors.factor ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2`} 
                      disabled={isReadOnly || loading}
                      value={itemData.factor}
                      onChange={(e) => onChange(index, 'factor', e.target.value, false)}
                    >
                      <option value="">Chọn yếu tố...</option>
                      {categories?.injuryFactors?.map(f => (
                        <option key={f.id} value={f.id.toString()}>{f.name}</option>
                      ))}
                    </select>
                    {itemErrors.factor && <p className="text-red-500 text-xs mt-1">{itemErrors.factor}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-gray-700 text-sm font-medium">3. Phân theo nghề nghiệp</label>
                    <select 
                      className={`w-full md:w-1/2 border ${itemErrors.job ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2`} 
                      disabled={isReadOnly || loading}
                      value={itemData.job}
                      onChange={(e) => onChange(index, 'job', e.target.value, false)}
                    >
                      <option value="">Chọn nghề nghiệp...</option>
                      {categories?.occupations?.map(o => (
                        <option key={o.id} value={o.id.toString()}>{o.name}</option>
                      ))}
                    </select>
                    {itemErrors.job && <p className="text-red-500 text-xs mt-1">{itemErrors.job}</p>}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <AccidentSummaryForm 
                    isReadOnly={isReadOnly} 
                    title1={`4. Chi tiết vụ tai nạn số ${index + 1}`}
                    title2={`5. Thiệt hại do tai nạn lao động số ${index + 1}`}
                    data={itemData.summary}
                    onChange={(f, v) => onChange(index, f as string, v, true)}
                    errors={itemErrors}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
