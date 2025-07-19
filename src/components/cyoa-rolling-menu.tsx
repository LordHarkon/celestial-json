import { forwardRef, useState, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SimplifiedCyoa, SimplifiedObject } from "@/types/cyoa";
import { CyoaRolledItemCard } from "@/components/cyoa-rolled-item-card";
import { X, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type CyoaRollingMenuProps = {
  cyoaData: SimplifiedCyoa;
  onKeepItem?: (item: { item: SimplifiedObject; rowName: string }) => void;
  keptItems?: Array<{ item: SimplifiedObject; rowName: string }>;
  selectedRows: Set<string>;
};

export type CyoaRollingMenuRef = {
  getHeaderConfigs: () => never[];
  setHeaderConfigs: (configs: never[]) => void;
};

export const CyoaRollingMenu = forwardRef<CyoaRollingMenuRef, CyoaRollingMenuProps>(
  ({ cyoaData, onKeepItem, keptItems, selectedRows }, ref) => {
    const [rolledItems, setRolledItems] = useState<Array<{ item: SimplifiedObject; rowName: string }>>([]);
    const [numRolls, setNumRolls] = useState<number>(1);
    const [filterByRows, setFilterByRows] = useState<Set<string>>(new Set());

    useImperativeHandle(ref, () => ({
      getHeaderConfigs: () => [],
      setHeaderConfigs: () => {},
    }));

    const selectedRowsData = cyoaData.rows.filter((row) => selectedRows.has(row.id));
    const availableRows = selectedRowsData.map((row) => row.title);

    const getAllObjects = () => {
      const allObjects: Array<{ item: SimplifiedObject; rowName: string }> = [];

      selectedRowsData.forEach((row) => {
        if (filterByRows.size === 0 || filterByRows.has(row.title)) {
          row.objects.forEach((obj) => {
            allObjects.push({ item: obj, rowName: row.title });
          });
        }
      });

      return allObjects;
    };

    const rollSingleItem = () => {
      const allObjects = getAllObjects();
      if (allObjects.length === 0) return;

      const randomIndex = Math.floor(Math.random() * allObjects.length);
      const rolledItem = allObjects[randomIndex];
      setRolledItems([rolledItem]);
    };

    const rollMultipleItems = () => {
      const allObjects = getAllObjects();
      if (allObjects.length === 0) return;

      const rolled: Array<{ item: SimplifiedObject; rowName: string }> = [];
      const used = new Set<string>();

      for (let i = 0; i < Math.min(numRolls, allObjects.length); i++) {
        let attempts = 0;
        let randomIndex: number;

        do {
          randomIndex = Math.floor(Math.random() * allObjects.length);
          attempts++;
        } while (used.has(allObjects[randomIndex].item.id) && attempts < 100);

        if (attempts < 100) {
          used.add(allObjects[randomIndex].item.id);
          rolled.push(allObjects[randomIndex]);
        }
      }

      setRolledItems(rolled);
    };

    const handleRoll = () => {
      if (numRolls === 1) {
        rollSingleItem();
      } else {
        rollMultipleItems();
      }
    };

    const clearRolls = () => {
      setRolledItems([]);
    };

    const totalObjects = getAllObjects().length;

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min="1"
              max="20"
              value={numRolls}
              onChange={(e) => setNumRolls(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">items</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-48 justify-between">
                <span className="truncate">
                  {filterByRows.size === 0
                    ? "All rows"
                    : filterByRows.size === 1
                    ? Array.from(filterByRows)[0]
                    : `${filterByRows.size} rows selected`}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem
                onClick={() => setFilterByRows(new Set())}
                onSelect={(e) => e.preventDefault()}
                className="flex items-center gap-2"
              >
                <Checkbox checked={filterByRows.size === 0} />
                All rows
              </DropdownMenuItem>
              {availableRows.map((rowName) => (
                <DropdownMenuItem
                  key={rowName}
                  onClick={() => {
                    const newFilter = new Set(filterByRows);
                    if (newFilter.has(rowName)) {
                      newFilter.delete(rowName);
                    } else {
                      newFilter.add(rowName);
                    }
                    setFilterByRows(newFilter);
                  }}
                  onSelect={(e) => e.preventDefault()}
                  className="flex items-center gap-2"
                >
                  <Checkbox checked={filterByRows.has(rowName)} />
                  <span className="truncate">{rowName}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleRoll} disabled={totalObjects === 0}>
            Roll {numRolls > 1 ? `${numRolls} Items` : "Item"}
          </Button>

          {rolledItems.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={clearRolls}>
                    <X className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all rolls</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          {totalObjects} objects available from {selectedRowsData.length} selected rows
          {filterByRows.size > 0 && ` (filtered to ${filterByRows.size} row${filterByRows.size === 1 ? "" : "s"})`}
        </div>

        {rolledItems.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {rolledItems.length === 1 ? "Rolled Item" : `Rolled Items (${rolledItems.length})`}
            </h3>
            <div className="grid gap-4">
              {rolledItems.map((rolledItem, index) => (
                <CyoaRolledItemCard
                  key={`${rolledItem.item.id}-${index}`}
                  item={rolledItem.item}
                  rowName={rolledItem.rowName}
                  onKeepItem={onKeepItem}
                  onRollAgain={rollSingleItem}
                  isKept={keptItems?.some((kept) => kept.item.id === rolledItem.item.id) || false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);
