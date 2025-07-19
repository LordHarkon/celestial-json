import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, FileBox } from "lucide-react";
import type { Sheet } from "@/types/excel";

type SheetSelectorDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sheets: Sheet[];
  selectedSheets: Set<string>;
  expandedSheet: string | null;
  onToggleSheet: (sheetName: string) => void;
  onToggleAllSheets: () => void;
  onUpdateSheetName: (oldName: string, newName: string) => void;
  onSetExpandedSheet: (sheetName: string | null) => void;
  onLoadJson: () => void;
  processSheetName: (name: string) => string;
};

export function SheetSelectorDialog({
  isOpen,
  onOpenChange,
  sheets,
  selectedSheets,
  expandedSheet,
  onToggleSheet,
  onToggleAllSheets,
  onUpdateSheetName,
  onSetExpandedSheet,
  onLoadJson,
  processSheetName,
}: SheetSelectorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="absolute right-4 top-2.5">
          <FileBox className="w-4 h-4" />
          <span className="sr-only">Configure Sheets</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] sm:max-h-[80vh] w-[96vw] sm:w-full flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Sheets to Use</DialogTitle>
          <DialogDescription className="text-left">
            Choose the sheets you want to convert and use the roller.
            <br />
            <span className="underline">Select only the sheets containing perks</span> (they usually start from Chapter
            1).
            <br />
            You can also tell which sheets contain perks by what headers they contain.
            <br />
            An <span className="underline">example</span> of a sheet containing perks would have headers like:
            <br />
            <span className="font-bold">0, CP Cost, Name, Jumpdoc, Chapter, Description</span>
          </DialogDescription>
        </DialogHeader>
        <Button variant="outline" className="w-full" onClick={onToggleAllSheets}>
          {selectedSheets.size === sheets.length ? "Deselect All" : "Select All"}
        </Button>
        <div className="flex-1 p-1 overflow-y-auto border rounded-lg custom-scrollbar border-border">
          <div className="pr-2 space-y-2">
            {sheets.map((sheet: Sheet) => (
              <div key={sheet.name} className="border rounded-lg bg-card">
                <div
                  onClick={() => onToggleSheet(sheet.name)}
                  className="flex items-center p-4 space-x-2 transition-colors cursor-pointer hover:bg-muted/50"
                >
                  <Checkbox
                    id={sheet.name}
                    checked={selectedSheets.has(sheet.name)}
                    onCheckedChange={() => onToggleSheet(sheet.name)}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />
                  <div className="flex-1 grid gap-1.5">
                    <label className="text-sm font-medium leading-none">{sheet.name}</label>
                    <p className="text-sm text-muted-foreground">
                      Headers: {sheet.headers.map((header) => header.name).join(", ")}
                    </p>
                  </div>
                  {selectedSheets.has(sheet.name) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onSetExpandedSheet(expandedSheet === sheet.name ? null : sheet.name);
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
                          onUpdateSheetName(sheet.name, e.target.value)
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
          <Button onClick={onLoadJson} className="w-full" variant="outline" disabled={selectedSheets.size === 0}>
            Load Selected Sheets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
