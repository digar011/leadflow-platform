"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  Check,
  ChevronDown,
  Loader2,
  X,
} from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CSV_IMPORT_FIELDS, autoMapColumns } from "@/lib/utils/csvFields";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { UpgradeModal } from "@/components/subscription";
import { useQueryClient } from "@tanstack/react-query";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "upload" | "map" | "preview" | "import";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; field: string; message: string }[];
  total: number;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [duplicateStrategy, setDuplicateStrategy] = useState<"skip" | "overwrite" | "create">("skip");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { can } = useSubscription();

  const reset = useCallback(() => {
    setStep("upload");
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setDuplicateStrategy("skip");
    setImporting(false);
    setProgress(0);
    setResult(null);
    setShowErrors(false);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const parseFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a .csv file");
      return;
    }

    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length < 2) {
          alert("CSV file must have a header row and at least one data row");
          return;
        }

        const headers = data[0].map((h) => h.trim());
        const rows = data.slice(1).filter((row) => row.some((cell) => cell.trim()));

        setCsvHeaders(headers);
        setCsvData(rows);
        setColumnMapping(autoMapColumns(headers));
        setStep("map");
      },
      error: (error) => {
        alert(`Failed to parse CSV: ${error.message}`);
      },
    });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleMappingChange = (csvHeader: string, dbField: string) => {
    setColumnMapping((prev) => {
      const updated = { ...prev };
      if (dbField === "") {
        delete updated[csvHeader];
      } else {
        updated[csvHeader] = dbField;
      }
      return updated;
    });
  };

  const isMappingValid = () => {
    const mappedFields = Object.values(columnMapping);
    return mappedFields.includes("business_name");
  };

  const getMappedRows = () => {
    return csvData.map((row) => {
      const mapped: Record<string, string> = {};
      csvHeaders.forEach((header, idx) => {
        const dbField = columnMapping[header];
        if (dbField && row[idx] !== undefined) {
          mapped[dbField] = row[idx];
        }
      });
      return mapped;
    });
  };

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);

    const mappedRows = getMappedRows();
    const chunkSize = 50;
    const totalChunks = Math.ceil(mappedRows.length / chunkSize);
    let totalResult: ImportResult = { imported: 0, skipped: 0, errors: [], total: mappedRows.length };

    for (let i = 0; i < mappedRows.length; i += chunkSize) {
      const chunk = mappedRows.slice(i, i + chunkSize);

      try {
        const response = await fetch("/api/leads/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: chunk, duplicateStrategy }),
        });

        const data = await response.json();

        if (response.ok) {
          totalResult.imported += data.imported || 0;
          totalResult.skipped += data.skipped || 0;
          if (data.errors) {
            // Offset row numbers by chunk position
            const offsetErrors = data.errors.map((e: { row: number; field: string; message: string }) => ({
              ...e,
              row: e.row > 0 ? e.row + i : 0,
            }));
            totalResult.errors.push(...offsetErrors);
          }
        } else {
          totalResult.errors.push({
            row: 0,
            field: "batch",
            message: data.error || "Batch import failed",
          });
        }
      } catch {
        totalResult.errors.push({
          row: 0,
          field: "network",
          message: `Network error on batch ${Math.floor(i / chunkSize) + 1}`,
        });
      }

      setProgress(Math.min(100, Math.round(((i + chunkSize) / mappedRows.length) * 100)));
    }

    setResult(totalResult);
    setStep("import");
    setImporting(false);
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    queryClient.invalidateQueries({ queryKey: ["leadStats"] });
  };

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer",
          dragOver
            ? "border-gold bg-gold/10"
            : "border-white/20 hover:border-white/40"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-10 w-10 mx-auto text-text-muted mb-3" />
        <p className="text-text-primary font-medium">
          Drop your CSV file here or click to browse
        </p>
        <p className="text-sm text-text-muted mt-1">
          Supports .csv files up to 5,000 rows
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );

  const renderMapStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          <FileSpreadsheet className="h-4 w-4 inline mr-1" />
          {csvData.length} rows found
        </p>
        {!isMappingValid() && (
          <p className="text-sm text-status-error flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Map "Business Name" (required)
          </p>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2">
        {csvHeaders.map((header) => (
          <div key={header} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
            <span className="text-sm text-text-secondary w-40 truncate flex-shrink-0" title={header}>
              {header}
            </span>
            <span className="text-text-muted">→</span>
            <select
              value={columnMapping[header] || ""}
              onChange={(e) => handleMappingChange(header, e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-gold/50"
            >
              <option value="">-- Skip this column --</option>
              {CSV_IMPORT_FIELDS.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.label} {field.required ? "(required)" : ""}
                </option>
              ))}
            </select>
            {columnMapping[header] && (
              <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={() => setStep("upload")}>
          Back
        </Button>
        <Button onClick={() => setStep("preview")} disabled={!isMappingValid()}>
          Next: Preview
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => {
    const previewRows = getMappedRows().slice(0, 5);
    const mappedFieldKeys = [...new Set(Object.values(columnMapping))];

    return (
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Preview of first {Math.min(5, csvData.length)} rows ({csvData.length} total)
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {mappedFieldKeys.map((key) => (
                  <th key={key} className="text-left px-2 py-1 text-text-muted font-medium">
                    {CSV_IMPORT_FIELDS.find((f) => f.key === key)?.label || key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} className="border-b border-white/5">
                  {mappedFieldKeys.map((key) => (
                    <td key={key} className="px-2 py-1 text-text-secondary truncate max-w-[200px]">
                      {row[key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Duplicate Strategy */}
        <div>
          <p className="text-sm font-medium text-text-secondary mb-2">
            If a duplicate is found (matching email or business name):
          </p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "skip", label: "Skip", desc: "Keep existing" },
              { value: "overwrite", label: "Overwrite", desc: "Update existing" },
              { value: "create", label: "Create Anyway", desc: "Allow duplicates" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDuplicateStrategy(opt.value)}
                className={cn(
                  "p-3 rounded-lg border text-center transition-colors",
                  duplicateStrategy === opt.value
                    ? "border-gold bg-gold/10"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <p className={cn(
                  "text-sm font-medium",
                  duplicateStrategy === opt.value ? "text-gold" : "text-text-secondary"
                )}>
                  {opt.label}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={() => setStep("map")}>
            Back
          </Button>
          <Button onClick={handleImport} disabled={importing}>
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Importing...
              </>
            ) : (
              `Import ${csvData.length} Leads`
            )}
          </Button>
        </div>

        {importing && (
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderImportStep = () => {
    if (!result) return null;

    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          {result.imported > 0 ? (
            <Check className="h-12 w-12 text-green-400 mx-auto mb-2" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-orange-400 mx-auto mb-2" />
          )}
          <h3 className="text-lg font-semibold text-text-primary">Import Complete</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-2xl font-bold text-green-400">{result.imported}</p>
            <p className="text-xs text-text-muted">Imported</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-2xl font-bold text-yellow-400">{result.skipped}</p>
            <p className="text-xs text-text-muted">Skipped</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-2xl font-bold text-red-400">{result.errors.length}</p>
            <p className="text-xs text-text-muted">Errors</p>
          </div>
        </div>

        {result.errors.length > 0 && (
          <div>
            <button
              onClick={() => setShowErrors(!showErrors)}
              className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
            >
              <ChevronDown className={cn("h-3 w-3 transition-transform", showErrors && "rotate-180")} />
              {showErrors ? "Hide errors" : "Show errors"}
            </button>
            {showErrors && (
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-text-muted">
                    {err.row > 0 ? `Row ${err.row}: ` : ""}
                    <span className="text-status-error">{err.field}</span> — {err.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={handleClose}>Done</Button>
        </div>
      </div>
    );
  };

  const stepTitles: Record<Step, string> = {
    upload: "Import Leads — Upload CSV",
    map: "Import Leads — Map Columns",
    preview: "Import Leads — Preview & Confirm",
    import: "Import Leads — Results",
  };

  if (!can("csvExport")) {
    return (
      <UpgradeModal
        isOpen={isOpen}
        onClose={onClose}
        feature="csvExport"
        featureLabel="CSV Import"
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === "import" ? handleClose : onClose}
      title={stepTitles[step]}
    >
      {step === "upload" && renderUploadStep()}
      {step === "map" && renderMapStep()}
      {step === "preview" && renderPreviewStep()}
      {step === "import" && renderImportStep()}
    </Modal>
  );
}
