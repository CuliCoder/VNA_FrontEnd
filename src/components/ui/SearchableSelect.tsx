import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number | "";
  onChange: (value: string | number | "") => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  loading = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Sync input value with selected option
  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else {
      setInputValue("");
    }
  }, [value, options, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Revert input or clear if empty
        if (selectedOption) {
          setInputValue(selectedOption.label);
        } else {
          setInputValue("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption]);

  const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filteredOptions = options.filter((opt) =>
    removeAccents(opt.label).includes(removeAccents(inputValue))
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className={`w-full px-3 py-1 border border-gray-200 rounded-md text-sm bg-white flex items-center justify-between transition-colors ${
          disabled
            ? "bg-gray-50 cursor-not-allowed opacity-70"
            : "focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 hover:border-gray-300"
        }`}
      >
        <input
          type="text"
          className="w-full bg-transparent outline-none truncate text-gray-900 placeholder-gray-500"
          placeholder={loading ? "Đang tải..." : placeholder}
          value={inputValue}
          disabled={disabled || loading}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            if (e.target.value === "") {
              onChange("");
            }
          }}
          onClick={() => {
            if (!disabled) setIsOpen(true);
          }}
          onFocus={(e) => {
            if (!disabled) {
              setIsOpen(true);
              e.target.select();
            }
          }}
        />
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 cursor-pointer ${
            isOpen ? "rotate-180" : ""
          }`}
          onClick={() => {
            if (!disabled && !loading) {
              setIsOpen(!isOpen);
            }
          }}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 flex flex-col">
          <div className="overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-sm text-gray-500 text-center">Không tìm thấy kết quả</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 text-sm rounded-sm cursor-pointer flex items-center justify-between ${
                    opt.value === value
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setInputValue(opt.label);
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate pr-2">{opt.label}</span>
                  {opt.value === value && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
