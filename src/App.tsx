import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Info } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import type { ExcelFile, Sheet, JsonData } from "@/types/excel";
import { RollingMenu } from "@/components/rolling-menu";
import { HeaderMappingDialog } from "@/components/header-mapping-dialog";
import { FileSelector } from "@/components/file-selector";
import { TutorialDialog } from "@/components/tutorial-dialog";
import { SheetSelectorDialog } from "@/components/sheet-selector-dialog";

function App() {
  const [excelFile, setExcelFile] = useState<ExcelFile | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<Set<string>>(new Set());
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jsonData, setJsonData] = useState<JsonData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const resetStates = () => {
    setSelectedSheets(new Set());
    setExpandedSheet(null);
    setJsonData(null);
    setIsDialogOpen(true);
  };

  const processSheetName = (name: string): string => {
    // If it's ONLY "Chapter X" or "Chapter X:", return as is
    if (/^Chapter \d+:?$/.test(name)) {
      return name;
    }

    // Remove "Chapter X:" or "Chapter X" if followed by other text
    return name.replace(/Chapter \d+:?\s*(?=\S)/, "").trim();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheets: Sheet[] = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
          const headers = Object.keys(jsonData[0] || {});

          return {
            name: sheetName,
            headers,
            data: jsonData,
          };
        });

        setExcelFile({ sheets });
        setIsDialogOpen(true);
        resetStates();
      } catch (error) {
        console.error("Error processing file:", error);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      console.error("Error reading file");
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handlePreloadedFile = async (path: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/celestials/${path}`);
      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheets: Sheet[] = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
        const headers = Object.keys(jsonData[0] || {});

        return {
          name: sheetName,
          headers,
          data: jsonData,
        };
      });

      setExcelFile({ sheets });
      setIsDialogOpen(true);
      resetStates();
    } catch (error) {
      console.error("Error loading preloaded file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSheet = (sheetName: string) => {
    const newSelected = new Set(selectedSheets);
    if (newSelected.has(sheetName)) {
      newSelected.delete(sheetName);
      if (expandedSheet === sheetName) {
        setExpandedSheet(null);
      }
    } else {
      newSelected.add(sheetName);
      setExpandedSheet(sheetName);
    }
    setSelectedSheets(newSelected);
  };

  const updateSheetName = (oldName: string, newName: string) => {
    if (!excelFile) return;

    setExcelFile({
      sheets: excelFile.sheets.map((sheet: Sheet) => (sheet.name === oldName ? { ...sheet, name: newName } : sheet)),
    });
  };

  const handleLoadJson = () => {
    if (!excelFile) return;

    const selectedData = excelFile.sheets
      .filter((sheet: Sheet) => selectedSheets.has(sheet.name))
      .map((sheet: Sheet) => ({
        sheetName: processSheetName(sheet.name),
        data: sheet.data as Record<string, string | number | null>[],
      }));

    if (selectedData.length === 0) return;
    setJsonData(selectedData);
    setIsDialogOpen(false);
  };

  const updateHeaders = (mappings: Record<string, string>) => {
    if (!jsonData) return;

    const updatedData = jsonData.map((sheet) => ({
      sheetName: sheet.sheetName,
      data: sheet.data.map((item) => {
        const newItem: Record<string, string | number | null> = {};
        Object.entries(item).forEach(([key, value]) => {
          const newKey = mappings[key] || key;
          if (newItem[newKey] === undefined) {
            newItem[newKey] = value as string | number | null;
          }
        });
        return newItem;
      }),
    }));

    setJsonData(updatedData);
  };

  const toggleAllSheets = () => {
    if (selectedSheets.size === excelFile?.sheets.length) {
      setSelectedSheets(new Set());
      setExpandedSheet(null);
    } else {
      setSelectedSheets(new Set(excelFile?.sheets.map((sheet) => sheet.name)));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-2 sm:p-4 bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-2xl overflow-hidden shadow-lg">
        <CardHeader className="relative">
          <ThemeSwitcher />
          <TutorialDialog />
          {!isLoading && excelFile && (
            <>
              {jsonData && <HeaderMappingDialog jsonData={jsonData} onUpdateHeaders={updateHeaders} />}
              <SheetSelectorDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                sheets={excelFile.sheets}
                selectedSheets={selectedSheets}
                expandedSheet={expandedSheet}
                onToggleSheet={toggleSheet}
                onToggleAllSheets={toggleAllSheets}
                onUpdateSheetName={updateSheetName}
                onSetExpandedSheet={setExpandedSheet}
                onLoadJson={handleLoadJson}
                processSheetName={processSheetName}
              />
            </>
          )}

          <CardTitle className="text-2xl font-bold text-center">Celestial Roller</CardTitle>
          <CardDescription className="text-center">
            A specialized tool for Celestial spreadsheets. Load Excel files and use the roller to randomly select items
            based on filters. You can customize sheet names and standardize headers across sheets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid items-center w-full gap-4">
            <FileSelector onFileSelect={handlePreloadedFile} />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="h-auto px-1 cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:cursor-pointer hover:file:bg-primary/90"
              disabled={isLoading}
            />
            <div className="flex items-center gap-1 pl-1 -mt-4 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>You can only load .xlsx or .xls files.</span>
            </div>
          </div>

          {(isLoading || jsonData) && <div className="flex-1 h-px bg-border" />}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
            </div>
          )}

          {jsonData && (
            <div className="space-y-4">
              <RollingMenu jsonData={jsonData} />
              {/* <div className="p-4 border rounded-lg">
                <h3 className="mb-2 font-medium">Loaded JSON Data</h3>
                <pre className="p-4 rounded bg-muted overflow-auto max-h-[400px] custom-scrollbar">
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </div> */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
