import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import type { JsonData, Settings } from "@/types/excel";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

type HeaderMappingDialogProps = {
  jsonData: JsonData;
  onUpdateHeaders: (settings: Settings) => void;
};

export function SettingsDialog({ jsonData, onUpdateHeaders }: HeaderMappingDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [headerMappings, setHeaderMappings] = useState<Record<string, string>>({});
  const [hiddenHeaders, setHiddenHeaders] = useState<string[]>([]);

  // Get all unique headers
  const allHeaders = useMemo(() => {
    const headers = new Set<string>();
    jsonData.forEach((sheet) => {
      if (sheet.data[0]) {
        Object.keys(sheet.data[0]).forEach((header) => headers.add(header));
      }
    });
    return headers;
  }, [jsonData]);

  useEffect(() => {
    const initialMappings: Record<string, string> = {};
    allHeaders.forEach((header) => {
      initialMappings[header] = header;
    });
    setHeaderMappings(initialMappings);
  }, [jsonData, allHeaders]);

  const handleSave = () => {
    // Update hidden headers to match new header names
    const updatedHiddenHeaders = hiddenHeaders
      .map((header) => headerMappings[header] || header)
      .filter((header) => Object.values(headerMappings).includes(header));

    // Remove duplicates
    const uniqueHiddenHeaders = [...new Set(updatedHiddenHeaders)];

    onUpdateHeaders({
      mappings: headerMappings,
      hiddenHeaders: uniqueHiddenHeaders,
    });
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="absolute right-14 top-2.5">
          <Settings2 className="w-4 h-4" />
          <span className="sr-only">Header Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Header Mappings</DialogTitle>
          <DialogDescription>
            Rename headers to standardize them across sheets. Similar headers will be merged.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-4">
            {Array.from(allHeaders).map((header) => (
              <div key={header} className="grid grid-cols-[1fr,auto,1fr] sm:gap-4 gap-2 items-center">
                <div className="text-sm font-medium truncate">{header}</div>
                <span>→</span>
                <Input
                  value={headerMappings[header] || ""}
                  onChange={(e) => setHeaderMappings({ ...headerMappings, [header]: e.target.value })}
                  className="h-8"
                />
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Visible Headers</h3>
              <p className="text-sm text-muted-foreground">Hide headers that you don't want to see in rolled items.</p>
            </div>
            {Array.from(allHeaders).map((header) => (
              <div key={header} className="flex items-center gap-2">
                <Checkbox
                  id={`visible-${header}`}
                  checked={!hiddenHeaders.includes(header)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setHiddenHeaders(hiddenHeaders.filter((h) => h !== header));
                    } else {
                      setHiddenHeaders([...hiddenHeaders, header]);
                    }
                  }}
                />
                <Label htmlFor={`visible-${header}`}>{headerMappings[header] || header}</Label>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </DialogContent>
    </Dialog>
  );
}
