"use client";

import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  multiSelect?: boolean;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  options,
  selected,
  onChange,
  multiSelect = false,
}) => {
  const [expanded, setExpanded] = useState(true);

  const handleChange = (value: string) => {
    if (multiSelect) {
      onChange(
        selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value],
      );
    } else {
      onChange(selected.includes(value) ? [] : [value]);
    }
  };

  return (
    <div className="border-b border-slate-100 py-5 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-3 hover:opacity-80 transition-opacity"
      >
        <span className="font-semibold text-slate-900 text-sm">{title}</span>
        <ChevronDown
          size={16}
          className={`transition-transform text-slate-600 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="space-y-2.5">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <input
                type={multiSelect ? "checkbox" : "radio"}
                name={title}
                checked={selected.includes(option.value)}
                onChange={() => handleChange(option.value)}
                className="rounded border-slate-300 cursor-pointer"
              />
              <span className="flex-1 text-sm text-slate-700 font-medium">
                {option.label}
              </span>
              {option.count !== undefined && (
                <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-semibold">
                  {option.count}
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarFilterProps {
  title: string;
  groups: Array<{
    title: string;
    options: FilterOption[];
    selected: string[];
  }>;
  onGroupChange: (groupIndex: number, values: string[]) => void;
  onReset?: () => void;
}

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  title,
  groups,
  onGroupChange,
  onReset,
}) => {
  const hasActiveFilters = groups.some((g) => g.selected.length > 0);

  return (
    <div className="w-64 bg-white rounded-lg border border-slate-200 p-4 h-fit sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900">{title}</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-4">
        {groups.map((group, index) => (
          <FilterGroup
            key={index}
            title={group.title}
            options={group.options}
            selected={group.selected}
            onChange={(values) => onGroupChange(index, values)}
          />
        ))}
      </div>
    </div>
  );
};

interface ActiveFilterProps {
  filters: Array<{ label: string; value: string }>;
  onRemove: (value: string) => void;
  onClear: () => void;
}

export const ActiveFilters: React.FC<ActiveFilterProps> = ({
  filters,
  onRemove,
  onClear,
}) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filters.map((filter) => (
        <div
          key={filter.value}
          className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => onRemove(filter.value)}
            className="hover:text-blue-900"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={onClear}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        Clear all
      </button>
    </div>
  );
};
