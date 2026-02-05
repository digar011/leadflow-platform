"use client";

import { useState } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { LEAD_STATUSES, LEAD_TEMPERATURES, LEAD_SOURCES } from "@/lib/utils/constants";
import type { LeadFilters as LeadFiltersType } from "@/lib/hooks/useLeads";

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFiltersChange: (filters: LeadFiltersType) => void;
}

export function LeadFilters({ filters, onFiltersChange }: LeadFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || "");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSearchSubmit = () => {
    onFiltersChange({ ...filters, search: searchValue });
  };

  const handleFilterChange = (key: keyof LeadFiltersType, value: string) => {
    if (value === "") {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange(newFilters);
    } else {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  const clearFilters = () => {
    setSearchValue("");
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof LeadFiltersType]
  ).length;

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search leads by name, email, city..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            className="w-full h-10 rounded-lg bg-background-secondary border border-white/10 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
          />
        </div>

        {/* Status Filter */}
        <Select
          options={[
            { value: "", label: "All Statuses" },
            ...LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label })),
          ]}
          value={filters.status || ""}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-40"
        />

        {/* Temperature Filter */}
        <Select
          options={[
            { value: "", label: "All Temps" },
            ...LEAD_TEMPERATURES.map((t) => ({ value: t.value, label: t.label })),
          ]}
          value={filters.temperature || ""}
          onChange={(e) => handleFilterChange("temperature", e.target.value)}
          className="w-32"
        />

        {/* Advanced Filters Toggle */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          leftIcon={<Filter className="h-4 w-4" />}
          rightIcon={
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          }
        >
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="gold" size="sm" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-background-secondary border border-white/5">
          {/* Source */}
          <Select
            label="Source"
            options={[
              { value: "", label: "All Sources" },
              ...LEAD_SOURCES.map((s) => ({ value: s.value, label: s.label })),
            ]}
            value={filters.source || ""}
            onChange={(e) => handleFilterChange("source", e.target.value)}
          />

          {/* Date From */}
          <Input
            label="Created From"
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
          />

          {/* Date To */}
          <Input
            label="Created To"
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
          />

          {/* Assigned To - Would need users list */}
          <div className="flex items-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSearchSubmit}
              className="w-full"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="gold" className="gap-1">
              Status: {LEAD_STATUSES.find((s) => s.value === filters.status)?.label}
              <button
                onClick={() => handleFilterChange("status", "")}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.temperature && (
            <Badge variant="gold" className="gap-1">
              Temp: {LEAD_TEMPERATURES.find((t) => t.value === filters.temperature)?.label}
              <button
                onClick={() => handleFilterChange("temperature", "")}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.source && (
            <Badge variant="gold" className="gap-1">
              Source: {LEAD_SOURCES.find((s) => s.value === filters.source)?.label}
              <button
                onClick={() => handleFilterChange("source", "")}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.search && (
            <Badge variant="gold" className="gap-1">
              Search: {filters.search}
              <button
                onClick={() => {
                  setSearchValue("");
                  handleFilterChange("search", "");
                }}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
