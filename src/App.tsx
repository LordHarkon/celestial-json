import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import type { ExcelFile, Sheet } from "@/types/excel";

function App() {
  const [excelFile, setExcelFile] = useState<ExcelFile | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<Set<string>>(new Set());
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setSelectedSheets(new Set());
      } catch (error) {
        console.error("Error processing file:", error);
        // You might want to show an error message to the user here
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

  const updateHeaderName = (sheetName: string, originalHeader: string, newName: string) => {
    if (!excelFile) return;

    setExcelFile({
      sheets: excelFile.sheets.map((sheet: Sheet) => {
        if (sheet.name === sheetName) {
          return {
            ...sheet,
            renamedHeaders: {
              ...sheet.renamedHeaders,
              [originalHeader]: newName || originalHeader,
            },
          };
        }
        return sheet;
      }),
    });
  };

  const updateSheetName = (oldName: string, newName: string) => {
    if (!excelFile) return;

    setExcelFile({
      sheets: excelFile.sheets.map((sheet: Sheet) => (sheet.name === oldName ? { ...sheet, name: newName } : sheet)),
    });
  };

  const handleDownload = () => {
    if (!excelFile) return;

    const selectedData = excelFile.sheets
      .filter((sheet: Sheet) => selectedSheets.has(sheet.name))
      .map((sheet: Sheet) => ({
        sheetName: sheet.name,
        data: sheet.data.map((row: Record<string, unknown>) => {
          const newRow: Record<string, unknown> = {};
          Object.entries(row).forEach(([key, value]) => {
            const newKey = sheet.renamedHeaders?.[key] || key;
            newRow[newKey] = value;
          });
          return newRow;
        }),
      }));

    if (selectedData.length === 0) return;

    const jsonString = JSON.stringify(selectedData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "excel-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-muted">
      <ThemeSwitcher />
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Celestial JSON</CardTitle>
          <CardDescription className="text-center">
            A specialized tool for Celestial CYOA spreadsheets. Convert Excel sheets to JSON format while customizing
            sheet and column names.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid items-center w-full gap-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="h-auto px-1 cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:cursor-pointer hover:file:bg-primary/90"
              disabled={isLoading}
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
            </div>
          )}

          {!isLoading && excelFile && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="mb-2 font-medium">Select Sheets to Export</h3>
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
                              value={sheet.name}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateSheetName(sheet.name, e.target.value)
                              }
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Column Names</h4>
                            <div className="grid gap-2">
                              {sheet.headers.map((header) => (
                                <div key={header} className="flex items-center gap-2">
                                  <Input
                                    defaultValue={sheet.renamedHeaders?.[header] || header}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                      updateHeaderName(sheet.name, header, e.target.value)
                                    }
                                    className="h-8"
                                    placeholder={header}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={handleDownload} disabled={selectedSheets.size === 0}>
                Download Selected Sheets
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
