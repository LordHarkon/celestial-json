import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CyoaRolledItemCard } from "@/components/cyoa-rolled-item-card";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import type { SimplifiedObject } from "@/types/cyoa";

type CyoaKeptItemsDialogProps = {
  items: Array<{ item: SimplifiedObject; rowName: string }>;
  onRemove: (id: string) => void;
};

export function CyoaKeptItemsDialog({ items, onRemove }: CyoaKeptItemsDialogProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const getItemName = (item: SimplifiedObject, rowName: string) => {
    // CYOA objects have a title field
    const name = item.title || `Item from ${rowName}`;
    return name;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Collection ({items.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your CYOA Collection</DialogTitle>
          <DialogDescription>
            These are the objects you've kept from your CYOA rolls. You can expand each item to see its details,
            including any addons, or remove it from your collection. The total number of items is shown on the button.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items in your collection yet.</p>
              <p className="text-sm">Roll some items and click "Keep" to add them here!</p>
            </div>
          ) : (
            items.map((keptItem, index) => (
              <div key={keptItem.item.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center justify-between flex-1 gap-2"
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  >
                    <span className="truncate">{getItemName(keptItem.item, keptItem.rowName)}</span>
                    {expandedIndex === index ? (
                      <ChevronUp className="flex-shrink-0 w-4 h-4" />
                    ) : (
                      <ChevronDown className="flex-shrink-0 w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onRemove(keptItem.item.id)}>
                    Remove
                  </Button>
                </div>
                {expandedIndex === index && (
                  <CyoaRolledItemCard
                    item={keptItem.item}
                    rowName={keptItem.rowName}
                    isKept={true}
                    onKeepItem={undefined}
                    onRollAgain={undefined}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
