import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, FileBox } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import type { ExcelFile, Sheet, JsonData } from "@/types/excel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RollingMenu } from "@/components/rolling-menu";
import { HeaderMappingDialog } from "@/components/header-mapping-dialog";
import { FileSelector } from "@/components/file-selector";

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
        sheetName: sheet.name,
        data: sheet.data,
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
        const newItem: Record<string, unknown> = {};
        Object.entries(item).forEach(([key, value]) => {
          const newKey = mappings[key] || key;
          if (newItem[newKey] === undefined) {
            newItem[newKey] = value;
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
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-muted">
      <ThemeSwitcher />
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="relative">
          {!isLoading && excelFile && (
            <div>
              {jsonData && <HeaderMappingDialog jsonData={jsonData} onUpdateHeaders={updateHeaders} />}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="icon" className="absolute right-4 top-4">
                    <FileBox className="w-4 h-4" />
                    <span className="sr-only">Configure Sheets</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                  <DialogHeader>
                    <DialogTitle>Select Sheets to Use</DialogTitle>
                    <DialogDescription>
                      Choose the sheets you want to convert and use the roller.
                      <br />
                      <span className="underline">Select only the sheets containing perks</span> (they usually start
                      from Chapter 1).
                      <br />
                      You can also tell which sheets contain perks by what headers they contain.
                      <br />
                      An <span className="underline">example</span> of a sheet containing perks would have headers like:
                      <br />
                      <span className="font-bold">0, CP Cost, Name, Jumpdoc, Chapter, Description</span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="pt-4 space-y-4">
                    <Button variant="outline" className="w-full" onClick={toggleAllSheets}>
                      {selectedSheets.size === excelFile?.sheets.length ? "Deselect All" : "Select All"}
                    </Button>
                    <div className="space-y-2">
                      {excelFile?.sheets.map((sheet: Sheet) => (
                        <div key={sheet.name} className="border rounded-lg bg-card">
                          <div
                            onClick={() => toggleSheet(sheet.name)}
                            className="flex items-center p-4 space-x-2 transition-colors cursor-pointer hover:bg-muted/50"
                          >
                            <Checkbox
                              id={sheet.name}
                              checked={selectedSheets.has(sheet.name)}
                              onCheckedChange={() => toggleSheet(sheet.name)}
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            />
                            <div className="flex-1 grid gap-1.5">
                              <label className="text-sm font-medium leading-none">{sheet.name}</label>
                              <p className="text-sm text-muted-foreground">Headers: {sheet.headers.join(", ")}</p>
                            </div>
                            {selectedSheets.has(sheet.name) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  setExpandedSheet(expandedSheet === sheet.name ? null : sheet.name);
                                }}
                              >
                                {expandedSheet === sheet.name ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>

                          {expandedSheet === sheet.name && (
                            <div className="p-4 space-y-4 border-t">
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Sheet Name</h4>
                                <Input
                                  value={processSheetName(sheet.name)}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    updateSheetName(sheet.name, e.target.value)
                                  }
                                  className="h-8"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleLoadJson} className="w-full" disabled={selectedSheets.size === 0}>
                      Load Selected Sheets
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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
