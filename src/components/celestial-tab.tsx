import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import type { ExcelFile, Sheet, JsonData, Settings, HeaderChange, Header } from "@/types/excel";
import { RollingMenu, RollingMenuRef } from "@/components/rolling-menu";
import { SettingsDialog } from "@/components/settings-dialog";
import { FileSelector } from "@/components/file-selector";
import { TutorialDialog } from "@/components/tutorial-dialog";
import { SheetSelectorDialog } from "@/components/sheet-selector-dialog";
import { Button } from "@/components/ui/button";
import { generateId } from "@/lib/generator";
import { KeptItemsDialog } from "@/components/kept-items-dialog";

export function CelestialTab() {
  const [excelFile, setExcelFile] = useState<ExcelFile | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<Set<string>>(new Set());
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jsonData, setJsonData] = useState<JsonData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    mappings: {},
    hiddenHeaders: ["_id"],
    headerChanges: [],
  });
  const [keptItems, setKeptItems] = useState<Array<{ item: Record<string, unknown>; sheetName: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rollingMenuRef = useRef<RollingMenuRef>(null);

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

  const processHeaders = (jsonData: Record<string, unknown>[]) => {
    if (!jsonData[0]) return [];
    return Object.keys(jsonData[0]).map((header, index) => ({
      _id: generateId(),
      name: header,
      order: index,
    }));
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
          const headers: Header[] = [...processHeaders(jsonData)];
          headers.push({ _id: "_id", name: "_id", order: headers.length });

          const dataWithIds = jsonData.map((item) => ({
            ...item,
            _id: generateId(),
          }));

          return {
            name: sheetName,
            headers: headers,
            data: dataWithIds,
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
        const headers: Header[] = [...processHeaders(jsonData)];
        headers.push({ _id: "_id", name: "_id", order: headers.length });

        const dataWithIds = jsonData.map((item) => ({
          ...item,
          _id: generateId(),
        }));

        return {
          name: sheetName,
          headers: headers,
          data: dataWithIds,
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

  const updateHeaders = (newSettings: Settings) => {
    if (!jsonData) return;
    setSettings(newSettings);

    const updatedData = jsonData.map((sheet) => ({
      sheetName: sheet.sheetName,
      data: sheet.data.map((item) => {
        const newItem: Record<string, string | number | null> = {};

        Object.entries(item).forEach(([key, value]) => {
          const newKey = newSettings.mappings[key]?.to || key;
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

  const addKeptItem = (item: { item: Record<string, unknown>; sheetName: string }) => {
    setKeptItems([...keptItems, item]);
  };

  const removeKeptItem = (id: string) => {
    setKeptItems(keptItems.filter((item) => (item.item._id as string) !== id));
  };

  const exportState = () => {
    const state = {
      selectedSheets: Array.from(selectedSheets),
      settings,
      keptItems,
      headerConfigs: rollingMenuRef.current?.getHeaderConfigs() || [],
      excelFile,
    };

    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "celestial-roller-state.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importState = async (file: File) => {
    const text = await file.text();
    const state = JSON.parse(text);

    setSelectedSheets(new Set(state.selectedSheets));
    setSettings({
      ...state.settings,
      mappings: Object.entries(state.settings.mappings)
        .sort(([, a], [, b]) => (a as { order: number }).order - (b as { order: number }).order)
        .reduce((acc, [key, value]) => {
          acc[key] = value as { to: string; order: number };
          return acc;
        }, {} as Record<string, { to: string; order: number }>),
    });
    setKeptItems(state.keptItems);
    rollingMenuRef.current?.setHeaderConfigs(state.headerConfigs);

    if (state.excelFile) {
      setExcelFile(state.excelFile);

      // Recalculate jsonData from excelFile and selectedSheets
      const selectedData = state.excelFile.sheets
        .filter((sheet: Sheet) => state.selectedSheets.includes(sheet.name))
        .map((sheet: Sheet) => ({
          sheetName: processSheetName(sheet.name),
          data: sheet.data.map((item: Record<string, unknown>) => {
            const newItem = { ...item };

            // Group changes by 'to' field to handle multiple headers mapping to same target
            const changesByTarget: Record<string, HeaderChange[]> = {};
            state.settings.headerChanges.forEach((change: HeaderChange) => {
              if (!changesByTarget[change.to]) {
                changesByTarget[change.to] = [];
              }
              changesByTarget[change.to].push(change);
            });

            // Apply changes, handling multiple sources for same target
            Object.entries(changesByTarget).forEach(([, changes]) => {
              // Sort changes by timestamp to get latest changes first
              changes.sort((a, b) => b.timestamp - a.timestamp);

              // Find first matching source header that exists in the item
              const matchingChange = changes.find((change) => newItem[change.from] !== undefined);
              if (matchingChange) {
                newItem[matchingChange.to] = newItem[matchingChange.from];
                // Remove the source field if it's different from target
                if (matchingChange.from !== matchingChange.to) {
                  delete newItem[matchingChange.from];
                }
              }
            });

            // Sort headers based on mappings order
            const orderedItem: Record<string, unknown> = {};
            Object.entries(state.settings.mappings)
              .sort(([, a], [, b]) => (a as { order: number }).order - (b as { order: number }).order)
              .forEach(([, mapping]) => {
                if (newItem[(mapping as { to: string }).to] !== undefined) {
                  orderedItem[(mapping as { to: string }).to] = newItem[(mapping as { to: string }).to];
                }
              });

            // Add any remaining unmapped fields
            Object.entries(newItem).forEach(([key, value]) => {
              if (orderedItem[key] === undefined) {
                orderedItem[key] = value;
              }
            });

            return orderedItem;
          }),
        }));

      if (selectedData.length > 0) {
        setJsonData(selectedData);
        setIsDialogOpen(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        {!isLoading && excelFile && (
          <>
            {jsonData && <SettingsDialog jsonData={jsonData} settings={settings} onUpdateHeaders={updateHeaders} />}
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
      </div>

      <div className="flex gap-2">
        <Input
          type="file"
          accept=".json"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && importState(e.target.files[0])}
        />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          Import State
        </Button>
        <Button variant="outline" size="sm" onClick={exportState}>
          Export State
        </Button>
        <TutorialDialog />
        {keptItems.length > 0 && (
          <KeptItemsDialog
            items={keptItems}
            hiddenHeaders={new Set(settings.hiddenHeaders)}
            onRemove={removeKeptItem}
          />
        )}
      </div>

      <div className="grid gap-4 items-center w-full">
        <FileSelector onFileSelect={handlePreloadedFile} />
        <div className="flex gap-2 items-center">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <Input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="px-1 h-auto cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:cursor-pointer hover:file:bg-primary/90"
          disabled={isLoading}
        />
        <div className="flex gap-1 items-center pl-1 -mt-4 text-sm text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>You can only load .xlsx or .xls files.</span>
        </div>
      </div>

      {(isLoading || jsonData) && <div className="flex-1 h-px bg-border" />}

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
        </div>
      )}

      {jsonData && (
        <div className="space-y-4">
          <RollingMenu
            ref={rollingMenuRef}
            jsonData={jsonData}
            settings={settings}
            onKeepItem={addKeptItem}
            keptItems={keptItems}
          />
        </div>
      )}
    </div>
  );
}
