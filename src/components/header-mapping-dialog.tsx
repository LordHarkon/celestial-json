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
import { Settings } from "lucide-react";
import { useState, useEffect } from "react";
import type { JsonData } from "@/types/excel";

type HeaderMappingDialogProps = {
  jsonData: JsonData;
  onUpdateHeaders: (mappings: Record<string, string>) => void;
};

export function HeaderMappingDialog({ jsonData, onUpdateHeaders }: HeaderMappingDialogProps) {
  const [headerMappings, setHeaderMappings] = useState<Record<string, string>>({});

  // Get all unique headers
  const allHeaders = new Set<string>();
  jsonData.forEach((sheet) => {
    if (sheet.data[0]) {
      Object.keys(sheet.data[0]).forEach((header) => allHeaders.add(header));
    }
  });

  useEffect(() => {
    // Initialize mappings with current headers
    const initialMappings: Record<string, string> = {};
    allHeaders.forEach((header) => {
      initialMappings[header] = header;
    });
    setHeaderMappings(initialMappings);
  }, [jsonData]);

  const handleSave = () => {
    onUpdateHeaders(headerMappings);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="icon" className="absolute right-16 top-4">
          <Settings className="w-4 h-4" />
          <span className="sr-only">Map Headers</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Map Headers</DialogTitle>
          <DialogDescription>
            Rename headers to standardize them across sheets. Similar headers will be merged.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {Array.from(allHeaders).map((header) => (
            <div key={header} className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
              <div className="text-sm font-medium">{header}</div>
              <span>→</span>
              <Input
                value={headerMappings[header] || ""}
                onChange={(e) => setHeaderMappings({ ...headerMappings, [header]: e.target.value })}
                className="h-8"
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSave} className="w-full">
          Apply Header Mappings
        </Button>
      </DialogContent>
    </Dialog>
  );
}
