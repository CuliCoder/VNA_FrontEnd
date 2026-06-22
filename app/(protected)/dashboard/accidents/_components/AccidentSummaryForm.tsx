import React from 'react';
import { formatCurrency, parseCurrency } from '@/utils/format';

export interface AccidentSummaryData {
  totalAccidents: string;
  fatalAccidents: string;
  multipleVictimsAccidents: string;
  totalVictims: string;
  femaleVictims: string;
  deadVictims: string;
  severeInjuredVictims: string;
  unmanagedVictims: string;
  unmanagedFemaleVictims: string;
  unmanagedDeadVictims: string;
  unmanagedSevereInjuredVictims: string;
  medicalCost: string;
  salaryCost: string;
  compensationCost: string;
  totalCost: string;
  leaveDays: string;
  propertyDamage: string;
}

export const defaultAccidentSummaryData: AccidentSummaryData = {
  totalAccidents: "",
  fatalAccidents: "",
  multipleVictimsAccidents: "",
  totalVictims: "",
  femaleVictims: "",
  deadVictims: "",
  severeInjuredVictims: "",
  unmanagedVictims: "",
  unmanagedFemaleVictims: "",
  unmanagedDeadVictims: "",
  unmanagedSevereInjuredVictims: "",
  medicalCost: "",
  salaryCost: "",
  compensationCost: "",
  totalCost: "",
  leaveDays: "",
  propertyDamage: "",
};

interface AccidentSummaryFormProps {
  isReadOnly?: boolean;
  title1?: string;
  title2?: string;
  data: AccidentSummaryData;
  onChange: (field: keyof AccidentSummaryData, value: string) => void;
  errors?: Partial<Record<keyof AccidentSummaryData, string>>;
}

export default function AccidentSummaryForm({ 
  isReadOnly,
  title1 = "1. Tổng số vụ tai nạn lao động & số nạn nhân tai nạn lao động",
  title2 = "2. Thiệt hại do tai nạn lao động",
  data,
  onChange,
  errors = {}
}: AccidentSummaryFormProps) {
  React.useEffect(() => {
    if (isReadOnly) return;
    const medicalStr = data.medicalCost;
    const salaryStr = data.salaryCost;
    const compensationStr = data.compensationCost;
    
    if (!medicalStr && !salaryStr && !compensationStr) {
      if (data.totalCost !== "") {
        onChange('totalCost', "");
      }
      return;
    }

    const total = (Number(medicalStr) || 0) + (Number(salaryStr) || 0) + (Number(compensationStr) || 0);
    const totalStr = total.toString();
    
    if (totalStr !== data.totalCost) {
      onChange('totalCost', totalStr);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.medicalCost, data.salaryCost, data.compensationCost, data.totalCost, isReadOnly]);

  React.useEffect(() => {
    if (isReadOnly) return;
    
    if (data.totalAccidents === '0') {
      const fieldsToReset: (keyof AccidentSummaryData)[] = [
        "fatalAccidents", "multipleVictimsAccidents",
        "totalVictims", "femaleVictims", "deadVictims", "severeInjuredVictims",
        "unmanagedVictims", "unmanagedFemaleVictims", "unmanagedDeadVictims", "unmanagedSevereInjuredVictims",
        "medicalCost", "salaryCost", "compensationCost", "leaveDays", "propertyDamage"
      ];
      
      fieldsToReset.forEach(field => {
        if (data[field] !== "0") {
          onChange(field, "0");
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.totalAccidents, isReadOnly]);

  const isOtherFieldsReadOnly = isReadOnly || data.totalAccidents === '0';

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">{title1}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputField label="Tổng số vụ" value={data.totalAccidents} onChange={(v) => onChange('totalAccidents', v)} error={errors.totalAccidents} required isReadOnly={isReadOnly} />
          <InputField label="Tổng số vụ có người chết" value={data.fatalAccidents} onChange={(v) => onChange('fatalAccidents', v)} error={errors.fatalAccidents} required isReadOnly={isOtherFieldsReadOnly} />
          <InputField label="Tổng số vụ có 2 người bị nạn trở lên" value={data.multipleVictimsAccidents} onChange={(v) => onChange('multipleVictimsAccidents', v)} error={errors.multipleVictimsAccidents} required isReadOnly={isOtherFieldsReadOnly} />
          <div className="hidden md:block"></div>
          
          <InputField label="Tổng số người bị nạn" value={data.totalVictims} onChange={(v) => onChange('totalVictims', v)} error={errors.totalVictims} required isReadOnly={isOtherFieldsReadOnly} />
          <InputField label="Tổng số lao động nữ bị nạn" value={data.femaleVictims} onChange={(v) => onChange('femaleVictims', v)} error={errors.femaleVictims} required isReadOnly={isOtherFieldsReadOnly} />
          <InputField label="Tổng số người bị chết" value={data.deadVictims} onChange={(v) => onChange('deadVictims', v)} error={errors.deadVictims} required isReadOnly={isOtherFieldsReadOnly} />
          <InputField label="Tổng số người bị thương nặng" value={data.severeInjuredVictims} onChange={(v) => onChange('severeInjuredVictims', v)} error={errors.severeInjuredVictims} required isReadOnly={isOtherFieldsReadOnly} />
          
          <InputField label="Số người bị nạn không QL" value={data.unmanagedVictims} onChange={(v) => onChange('unmanagedVictims', v)} error={errors.unmanagedVictims} required isReadOnly={isOtherFieldsReadOnly} />
          <InputField label="Lao động nữ bị nạn không QL" value={data.unmanagedFemaleVictims} onChange={(v) => onChange('unmanagedFemaleVictims', v)} error={errors.unmanagedFemaleVictims} required isReadOnly={isOtherFieldsReadOnly} />
          <InputField label="Số người chết không QL" value={data.unmanagedDeadVictims} onChange={(v) => onChange('unmanagedDeadVictims', v)} error={errors.unmanagedDeadVictims} required isReadOnly={isOtherFieldsReadOnly} />
          <InputField label="Người bị thương nặng không QL" value={data.unmanagedSevereInjuredVictims} onChange={(v) => onChange('unmanagedSevereInjuredVictims', v)} error={errors.unmanagedSevereInjuredVictims} required isReadOnly={isOtherFieldsReadOnly} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-4">{title2}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputField label="Chi phí y tế" value={data.medicalCost} onChange={(v) => onChange('medicalCost', v)} error={errors.medicalCost} required isCurrency isReadOnly={isOtherFieldsReadOnly} />
          <InputField label="Chi phí trả lương trong thời gian điều trị" value={data.salaryCost} onChange={(v) => onChange('salaryCost', v)} error={errors.salaryCost} required isCurrency isReadOnly={isOtherFieldsReadOnly} />
          <InputField label="Chi phí bồi thường trợ cấp" value={data.compensationCost} onChange={(v) => onChange('compensationCost', v)} error={errors.compensationCost} required isCurrency isReadOnly={isOtherFieldsReadOnly} />
          <InputField label="Tổng số tiền chi phí" value={data.totalCost} onChange={(v) => onChange('totalCost', v)} error={errors.totalCost} required isCurrency isReadOnly={true} />
          
          <InputField label="Tổng số ngày nghỉ vì TNLĐ" value={data.leaveDays} onChange={(v) => onChange('leaveDays', v)} error={errors.leaveDays} required isReadOnly={isOtherFieldsReadOnly} />
          <InputField label="Thiệt hại tài sản" value={data.propertyDamage} onChange={(v) => onChange('propertyDamage', v)} error={errors.propertyDamage} isCurrency isReadOnly={isOtherFieldsReadOnly} />
        </div>
      </div>
    </div>
  );
}
interface InputFieldProps {
  label: string;
  required?: boolean;
  isCurrency?: boolean;
  isReadOnly?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function InputField({ label, required, isCurrency, isReadOnly, value, onChange, error }: InputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.startsWith('-')) val = val.replace('-', '');
    
    if (isCurrency) {
      onChange(parseCurrency(val));
    } else {
      onChange(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const displayValue = isCurrency ? formatCurrency(value) : value;

  return (
    <div className="space-y-1">
      <label className="text-gray-500 text-xs font-medium block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative flex">
        <input 
          type={isCurrency ? "text" : "number"}
          min={isCurrency ? undefined : "0"}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isReadOnly}
          className={`w-full border ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isReadOnly ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''} ${isCurrency ? 'pr-16' : ''}`}
        />
        {isCurrency && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
            (1.000đ)
          </span>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
