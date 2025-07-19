import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, ExternalLink } from "lucide-react";
import { useRef, useState } from "react";
import type {
  SimplifiedCyoa,
  SimplifiedRow,
  SimplifiedObject,
  CyoaSettings,
  PredefinedCyoa,
  FullCyoa,
  FullRow,
  FullObject,
  FullAddon,
} from "@/types/cyoa";
import { generateId } from "@/lib/generator";
import { CyoaRowSelectorDialog } from "@/components/cyoa-row-selector-dialog";
import { CyoaRollingMenu, CyoaRollingMenuRef } from "@/components/cyoa-rolling-menu";
import { CyoaTutorialDialog } from "@/components/cyoa-tutorial-dialog";
import { CyoaKeptItemsDialog } from "@/components/cyoa-kept-items-dialog";

const PREDEFINED_CYOAS: PredefinedCyoa[] = [
  {
    name: "Lt. Ouroumov's Worm CYOA V17",
    url: "https://raw.githubusercontent.com/ltouroumov/worm-cyoa-v6-fork/refs/heads/master/project-v17.json",
    description: "Form of the Interactive Worm CYOA V6 by Fae Witch.",
  },
];

export function CyoaTab() {
  const [cyoaFile, setCyoaFile] = useState<SimplifiedCyoa | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cyoaData, setCyoaData] = useState<SimplifiedCyoa | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<CyoaSettings>({
    selectedRows: new Set(),
    keptItems: [],
  });
  const [keptItems, setKeptItems] = useState<Array<{ item: SimplifiedObject; rowName: string }>>([]);
  const [selectedCyoaUrl, setSelectedCyoaUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stateFileInputRef = useRef<HTMLInputElement>(null);
  const rollingMenuRef = useRef<CyoaRollingMenuRef>(null);

  const resetStates = () => {
    setSelectedRows(new Set());
    setExpandedRow(null);
    setCyoaData(null);
    setIsDialogOpen(true);
    setError(null);
  };

  const processRowName = (name: string): string => {
    return name.trim();
  };

  const simplifyFullCyoa = (fullCyoa: FullCyoa): SimplifiedCyoa => {
    const simplifiedRows: SimplifiedRow[] =
      fullCyoa.rows?.map((row: FullRow) => ({
        id: row.id || generateId(),
        title: row.title || row.titleText || "Untitled Row",
        text: row.text,
        image: row.image,
        imageIsURL: row.imageIsURL,
        imageLink: row.imageLink,
        objects:
          row.objects?.map((obj: FullObject) => ({
            id: obj.id || generateId(),
            title: obj.title || "Untitled Object",
            text: obj.text,
            image: obj.image,
            imageIsURL: obj.imageIsURL,
            imageLink: obj.imageLink,
            addons: obj.addons?.map((addon: FullAddon) => ({
              id: addon.id || generateId(),
              title: addon.title || "Untitled Addon",
              text: addon.text,
              image: addon.image,
              imageIsURL: addon.imageIsURL,
              imageLink: addon.imageLink,
            })),
          })) || [],
      })) || [];

    return { rows: simplifiedRows };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const fullCyoa = JSON.parse(text);
      const simplified = simplifyFullCyoa(fullCyoa);

      setCyoaFile(simplified);
      resetStates();
    } catch (err) {
      setError("Error parsing CYOA file: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlLoad = async (url: string) => {
    if (!url) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch CYOA: ${response.statusText}`);
      }

      const fullCyoa = await response.json();
      const simplified = simplifyFullCyoa(fullCyoa);

      setCyoaFile(simplified);
      resetStates();
    } catch (err) {
      setError("Error loading CYOA: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (rowId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
      if (expandedRow === rowId) {
        setExpandedRow(null);
      }
    } else {
      newSelected.add(rowId);
      setExpandedRow(rowId);
    }
    setSelectedRows(newSelected);
  };

  const updateRowName = (rowId: string, newName: string) => {
    if (!cyoaFile) return;

    setCyoaFile({
      rows: cyoaFile.rows.map((row: SimplifiedRow) => (row.id === rowId ? { ...row, title: newName } : row)),
    });
  };

  const handleLoadJson = () => {
    if (!cyoaFile) return;

    const selectedData = {
      rows: cyoaFile.rows.filter((row: SimplifiedRow) => selectedRows.has(row.id)),
    };

    if (selectedData.rows.length === 0) return;
    setCyoaData(selectedData);
    setIsDialogOpen(false);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === cyoaFile?.rows.length) {
      setSelectedRows(new Set());
      setExpandedRow(null);
    } else {
      setSelectedRows(new Set(cyoaFile?.rows.map((row) => row.id)));
    }
  };

  const addKeptItem = (item: { item: SimplifiedObject; rowName: string }) => {
    setKeptItems([...keptItems, item]);
  };

  const removeKeptItem = (id: string) => {
    setKeptItems(keptItems.filter((item) => item.item.id !== id));
  };

  const exportState = () => {
    const state = {
      selectedRows: Array.from(selectedRows),
      settings,
      keptItems,
      cyoaFile,
    };

    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cyoa-roller-state.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importState = async (file: File) => {
    const text = await file.text();
    const state = JSON.parse(text);

    setSelectedRows(new Set(state.selectedRows));
    setSettings(state.settings);
    setKeptItems(state.keptItems);

    if (state.cyoaFile) {
      setCyoaFile(state.cyoaFile);

      const selectedData = {
        rows: state.cyoaFile.rows.filter((row: SimplifiedRow) => state.selectedRows.includes(row.id)),
      };

      if (selectedData.rows.length > 0) {
        setCyoaData(selectedData);
        setIsDialogOpen(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        {!isLoading && cyoaFile && (
          <CyoaRowSelectorDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            rows={cyoaFile.rows}
            selectedRows={selectedRows}
            expandedRow={expandedRow}
            onToggleRow={toggleRow}
            onToggleAllRows={toggleAllRows}
            onUpdateRowName={updateRowName}
            onSetExpandedRow={setExpandedRow}
            onLoadJson={handleLoadJson}
            processRowName={processRowName}
          />
        )}
      </div>

      <div className="flex gap-2">
        <Input
          type="file"
          accept=".json"
          className="hidden"
          ref={stateFileInputRef}
          onChange={(e) => e.target.files?.[0] && importState(e.target.files[0])}
        />
        <Button variant="outline" size="sm" onClick={() => stateFileInputRef.current?.click()}>
          Import State
        </Button>
        <Button variant="outline" size="sm" onClick={exportState}>
          Export State
        </Button>
        <CyoaTutorialDialog />
        <CyoaKeptItemsDialog items={keptItems} onRemove={removeKeptItem} />
      </div>

      <div className="grid gap-4 items-center w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <ExternalLink className="w-5 h-5" />
              Load from URL
            </CardTitle>
            <CardDescription>Load a CYOA from a predefined list or enter a custom URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedCyoaUrl} onValueChange={setSelectedCyoaUrl}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a predefined CYOA" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_CYOAS.map((cyoa) => (
                  <SelectItem key={cyoa.url} value={cyoa.url}>
                    {cyoa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 items-center">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter custom URL..."
                value={selectedCyoaUrl}
                onChange={(e) => setSelectedCyoaUrl(e.target.value)}
              />
              <Button onClick={() => handleUrlLoad(selectedCyoaUrl)} disabled={!selectedCyoaUrl || isLoading}>
                Load
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 items-center">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="px-1 h-auto cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:cursor-pointer hover:file:bg-primary/90"
          disabled={isLoading}
        />
        <div className="flex gap-1 items-center pl-1 -mt-4 text-sm text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>You can only load .json files.</span>
        </div>
      </div>

      {error && <div className="p-3 text-red-700 bg-red-50 rounded-md border border-red-200">{error}</div>}

      {(isLoading || cyoaData) && <div className="flex-1 h-px bg-border" />}

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
        </div>
      )}

      {cyoaData && (
        <div className="space-y-4">
          <CyoaRollingMenu
            ref={rollingMenuRef}
            cyoaData={cyoaData}
            selectedRows={selectedRows}
            onKeepItem={addKeptItem}
            keptItems={keptItems}
          />
        </div>
      )}
    </div>
  );
}
