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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
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
      setSelectedSheets(new Set()); // Reset selections on new file
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
      sheets: excelFile.sheets.map((sheet) => {
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
      sheets: excelFile.sheets.map((sheet) => (sheet.name === oldName ? { ...sheet, name: newName } : sheet)),
    });
  };

  const handleDownload = () => {
    if (!excelFile) return;

    const selectedData = excelFile.sheets
      .filter((sheet) => selectedSheets.has(sheet.name))
      .map((sheet) => ({
        sheetName: sheet.name,
        data: sheet.data.map((row) => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
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
          <div className="grid w-full items-center gap-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="cursor-pointer px-1 h-auto file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:cursor-pointer hover:file:bg-primary/90"
            />
          </div>

          {excelFile && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Select Sheets to Export</h3>
                <div className="space-y-2">
                  {excelFile?.sheets.map((sheet) => (
                    <div key={sheet.name} className="rounded-lg border bg-card">
                      <div
                        onClick={() => toggleSheet(sheet.name)}
                        className="flex items-center space-x-2 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          id={sheet.name}
                          checked={selectedSheets.has(sheet.name)}
                          onCheckedChange={() => toggleSheet(sheet.name)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 grid gap-1.5">
                          <label className="text-sm font-medium leading-none">{sheet.name}</label>
                          <p className="text-sm text-muted-foreground">Headers: {sheet.headers.join(", ")}</p>
                        </div>
                        {selectedSheets.has(sheet.name) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedSheet(expandedSheet === sheet.name ? null : sheet.name);
                            }}
                          >
                            {expandedSheet === sheet.name ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>

                      {expandedSheet === sheet.name && (
                        <div className="p-4 border-t space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Sheet Name</h4>
                            <Input
                              value={sheet.name}
                              onChange={(e) => updateSheetName(sheet.name, e.target.value)}
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
                                    onChange={(e) => updateHeaderName(sheet.name, header, e.target.value)}
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
