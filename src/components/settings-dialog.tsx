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
import { Settings as Settings2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import type { Header, HeaderChange, JsonData, Settings } from "@/types/excel";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { generateId } from "@/lib/generator";

type HeaderMappingDialogProps = {
  jsonData: JsonData;
  settings: Settings;
  onUpdateHeaders: (settings: Settings) => void;
};

export function SettingsDialog({ jsonData, settings, onUpdateHeaders }: HeaderMappingDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [headerMappings, setHeaderMappings] = useState<Record<string, { to: string; order: number }>>(
    settings?.mappings ?? {},
  );
  const [hiddenHeaders, setHiddenHeaders] = useState<string[]>(settings?.hiddenHeaders ?? ["_id"]);

  // Get all unique headers with their IDs
  const allHeaders = useMemo(() => {
    const headers = new Map<string, Header>();
    jsonData.forEach((sheet) => {
      if (sheet.data[0]) {
        const sheetHeaders = Object.keys(sheet.data[0])
          .filter((header) => header !== "_id")
          .map((header, index) => ({
            _id: generateId(),
            name: header,
            order: index,
          }));

        sheetHeaders.forEach((header) => {
          if (!headers.has(header.name)) {
            headers.set(header.name, header);
          }
        });
      }
    });
    return Array.from(headers.values());
  }, [jsonData]);

  useEffect(() => {
    const initialMappings: Record<string, { to: string; order: number }> = { ...settings?.mappings };
    allHeaders.forEach((header) => {
      initialMappings[header.name] = { to: header.name, order: header.order };
    });
    setHeaderMappings(initialMappings);
    setHiddenHeaders(settings?.hiddenHeaders ?? ["_id"]);
  }, [jsonData, allHeaders]);

  const handleSave = () => {
    const existingChanges = new Map(settings.headerChanges.map((change) => [`${change.from}-${change.to}`, change]));

    // Create ordered mappings
    const orderedMappings = Array.from(allHeaders)
      .sort((a, b) => a.order - b.order)
      .reduce((acc, header) => {
        acc[header.name] = {
          to: headerMappings[header.name]?.to || header.name,
          order: header.order,
        };
        return acc;
      }, {} as Record<string, { to: string; order: number }>);

    const headerChanges = Object.entries(headerMappings)
      .filter(([from, to]) => from !== to.to)
      .map(([from, to]) => {
        const key = `${from}-${to.to}`;
        if (existingChanges.has(key)) {
          return existingChanges.get(key)!;
        }
        const header = allHeaders.find((h) => h.name === from);
        return {
          id: header?._id || generateId(),
          from,
          to: to.to,
          timestamp: Date.now(),
        };
      });

    onUpdateHeaders({
      mappings: orderedMappings,
      hiddenHeaders,
      headerChanges: headerChanges as HeaderChange[],
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
            {Array.from(allHeaders)
              .sort((a, b) => a.order - b.order)
              .map((header) => (
                <div key={header.name} className="grid grid-cols-[1fr,auto,1fr] sm:gap-4 gap-2 items-center">
                  <div className="text-sm font-medium truncate">{header.name}</div>
                  <span>→</span>
                  <Input
                    value={headerMappings[header.name]?.to || ""}
                    onChange={(e) =>
                      setHeaderMappings({
                        ...headerMappings,
                        [header.name]: { to: e.target.value, order: header.order },
                      })
                    }
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
              <div key={header.name} className="flex items-center gap-2">
                <Checkbox
                  id={`visible-${header.name}`}
                  checked={!hiddenHeaders.includes(header.name)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setHiddenHeaders(hiddenHeaders.filter((h) => h !== header.name));
                    } else {
                      setHiddenHeaders([...hiddenHeaders, header.name]);
                    }
                  }}
                />
                <Label htmlFor={`visible-${header.name}`}>{headerMappings[header.name]?.to || header.name}</Label>
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
