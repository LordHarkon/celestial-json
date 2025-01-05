import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RolledItemCard } from "./rolled-item-card";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";

type KeptItemsDialogProps = {
  items: Array<{ item: Record<string, unknown>; sheetName: string }>;
  hiddenHeaders: Set<string>;
  onRemove: (id: string) => void;
};

export function KeptItemsDialog({ items, hiddenHeaders, onRemove }: KeptItemsDialogProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const getItemName = (item: Record<string, unknown>) => {
    const nameKey = Object.keys(item).find((key) => !hiddenHeaders.has(key) && key.toLowerCase().includes("name"));
    const costKey = Object.keys(item).find(
      (key) => !hiddenHeaders.has(key) && (key.toLowerCase().includes("cost") || key.toLowerCase().includes("price")),
    );

    const name = nameKey ? String(item[nameKey]) : `Item from ${item.sheetName}`;
    const cost = costKey ? ` (${String(item[costKey])})` : "";

    return name + cost;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Build ({items.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Build</DialogTitle>
          <DialogDescription>
            These are the perks you've kept for your build. You can expand each perk to see its details or remove it
            from your build. The total number of perks is shown on the button.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.item._id as string} className="space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  className="flex items-center justify-between w-full gap-2"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <span className="truncate">{getItemName(item.item)}</span>
                  {expandedIndex === index ? (
                    <ChevronUp className="flex-shrink-0 w-4 h-4" />
                  ) : (
                    <ChevronDown className="flex-shrink-0 w-4 h-4" />
                  )}
                </Button>
              </div>
              {expandedIndex === index && (
                <RolledItemCard
                  item={item.item}
                  sheetName={item.sheetName}
                  hiddenHeaders={hiddenHeaders}
                  isKept
                  onRemove={onRemove}
                />
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
