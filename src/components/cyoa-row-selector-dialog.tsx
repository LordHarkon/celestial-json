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
import type { SimplifiedRow } from "@/types/cyoa";

type CyoaRowSelectorDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rows: SimplifiedRow[];
  selectedRows: Set<string>;
  expandedRow: string | null;
  onToggleRow: (rowId: string) => void;
  onToggleAllRows: () => void;
  onUpdateRowName: (oldName: string, newName: string) => void;
  onSetExpandedRow: (rowId: string | null) => void;
  onLoadJson: () => void;
  processRowName: (name: string) => string;
};

export function CyoaRowSelectorDialog({
  isOpen,
  onOpenChange,
  rows,
  selectedRows,
  expandedRow,
  onToggleRow,
  onToggleAllRows,
  onUpdateRowName,
  onSetExpandedRow,
  onLoadJson,
  processRowName,
}: CyoaRowSelectorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="absolute right-4 top-2.5">
          <FileBox className="w-4 h-4" />
          <span className="sr-only">Configure Rows</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] sm:max-h-[80vh] w-[96vw] sm:w-full flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Rows to Use</DialogTitle>
          <DialogDescription className="text-left">
            Choose the rows you want to use for rolling random items.
            <br />
            <span className="underline">Select only the rows containing objects you want to roll from</span>.
            <br />
            You can see how many objects each row contains to help you decide.
            <br />
            An <span className="underline">example</span> of a good row would be one with multiple objects
            <br />
            representing different choices or options.
          </DialogDescription>
        </DialogHeader>
        <Button variant="outline" className="w-full" onClick={onToggleAllRows}>
          {selectedRows.size === rows.length ? "Deselect All" : "Select All"}
        </Button>
        <div className="flex-1 p-1 overflow-y-auto border rounded-lg custom-scrollbar border-border">
          <div className="pr-2 space-y-2">
            {rows.map((row: SimplifiedRow) => (
              <div key={row.id} className="border rounded-lg bg-card">
                <div
                  onClick={() => onToggleRow(row.id)}
                  className="flex items-center p-4 space-x-2 transition-colors cursor-pointer hover:bg-muted/50"
                >
                  <Checkbox
                    id={row.id}
                    checked={selectedRows.has(row.id)}
                    onCheckedChange={() => onToggleRow(row.id)}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />
                  <div className="flex-1 grid gap-1.5">
                    <label className="text-sm font-medium leading-none">{row.title}</label>
                    <p className="text-sm text-muted-foreground">
                      {row.objects.length} objects available
                      {row.text && ` • ${row.text.slice(0, 100)}${row.text.length > 100 ? "..." : ""}`}
                    </p>
                  </div>
                  {selectedRows.has(row.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onSetExpandedRow(expandedRow === row.id ? null : row.id);
                      }}
                    >
                      {expandedRow === row.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  )}
                </div>

                {expandedRow === row.id && (
                  <div className="p-4 space-y-4 border-t">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Row Name</h4>
                      <Input
                        value={processRowName(row.title)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateRowName(row.id, e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Objects in this row</h4>
                      <div className="max-h-32 overflow-y-auto text-sm text-muted-foreground">
                        {row.objects.map((obj, index) => (
                          <div key={obj.id} className="py-1">
                            {index + 1}. {obj.title}
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
        <DialogFooter>
          <Button onClick={onLoadJson} className="w-full" variant="outline" disabled={selectedRows.size === 0}>
            Load Selected Rows
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
