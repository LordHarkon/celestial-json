import { forwardRef, useState, useImperativeHandle, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SimplifiedCyoa, SimplifiedObject } from "@/types/cyoa";
import type { HeaderConfig, HeaderType } from "@/types/excel"; // Reusing types if possible, or define new ones
import { CyoaRolledItemCard } from "@/components/cyoa-rolled-item-card";
import { X, ChevronDown, Ban } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type CyoaRollingMenuProps = {
  cyoaData: SimplifiedCyoa;
  fullCyoa?: SimplifiedCyoa | null;
  onKeepItem?: (item: { item: SimplifiedObject; rowName: string }) => void;
  keptItems?: Array<{ item: SimplifiedObject; rowName: string }>;
  selectedRows: Set<string>;
};

export type CyoaRollingMenuRef = {
  getHeaderConfigs: () => HeaderConfig[];
  setHeaderConfigs: (configs: HeaderConfig[]) => void;
};

export const CyoaRollingMenu = forwardRef<CyoaRollingMenuRef, CyoaRollingMenuProps>(
  ({ cyoaData, fullCyoa, onKeepItem, keptItems, selectedRows }, ref) => {
    const [rolledItems, setRolledItems] = useState<Array<{ item: SimplifiedObject; rowName: string }>>([]);
    const [numRolls, setNumRolls] = useState<number>(1);
    const [filterByRows, setFilterByRows] = useState<Set<string>>(new Set());
    const [headerConfigs, setHeaderConfigs] = useState<HeaderConfig[]>([]);

    useImperativeHandle(ref, () => ({
      getHeaderConfigs: () => headerConfigs,
      setHeaderConfigs: (configs: HeaderConfig[]) => setHeaderConfigs(configs),
    }));

    const selectedRowsData = cyoaData.rows.filter((row) => selectedRows.has(row.id));
    const availableRows = selectedRowsData.map((row) => row.title);

    // Build available "headers" for filtering
    // Standard headers: "Title", "Text"
    // Dynamic headers: "Score: [Point Name]"
    const pointTypeHeaders = cyoaData.pointTypes?.map((pt) => `Score: ${pt.name} (${pt.id})`) || [];
    const availableHeaders = ["Title", "Text", ...pointTypeHeaders];

    const addHeaderConfig = () => {
      setHeaderConfigs([...headerConfigs, { name: "" }]);
    };

    const updateHeaderConfig = (index: number, field: keyof HeaderConfig, value: string) => {
      const newConfigs = [...headerConfigs];
      if (field === "type") {
        newConfigs[index] = { ...newConfigs[index], [field]: value as HeaderType };
      } else {
        newConfigs[index] = { ...newConfigs[index], [field]: value };
      }
      setHeaderConfigs(newConfigs);
    };

    const removeHeaderConfig = (index: number) => {
      setHeaderConfigs(headerConfigs.filter((_, i) => i !== index));
    };

    const parsePrice = useCallback((price: string | number): number => {
      if (typeof price === "number") return price;
      if (!price) return 0;
      if (price.toLowerCase() === "free") return 0;
      const numMatch = price.match(/-?\d+/);
      return numMatch ? parseInt(numMatch[0], 10) : 0;
    }, []);

    const checkFilterMatch = useCallback(
      (item: SimplifiedObject, config: HeaderConfig): boolean => {
        if (!config.name || !config.type || (typeof config.value != "number" && !config.value)) return true;

        let itemValue: string | number = "";

        if (config.name === "Title") {
          itemValue = item.title;
        } else if (config.name === "Text") {
          itemValue = item.text || "";
        } else if (config.name.startsWith("Score: ")) {
          // Extract Point Type ID from header name "Score: Name (id)"
          const match = config.name.match(/\(([^)]+)\)$/);
          const ptId = match ? match[1] : "";
          const score = item.scores?.find((s) => s.id === ptId);
          itemValue = score ? score.value : "0"; // Default to 0 if no score of that type
        }

        let matches = false;
        switch (config.type) {
          case "index":
          case "price": {
            const val = config.type === "price" ? parsePrice(itemValue) : parseInt(itemValue as string, 10);
            const compareValue = parseInt(config.value as string, 10);

            if (isNaN(val) || isNaN(compareValue)) {
              matches = false;
              break;
            }

            switch (config.comparison || "eq") {
              case "lt":
                matches = val < compareValue;
                break;
              case "lte":
                matches = val <= compareValue;
                break;
              case "eq":
                matches = val === compareValue;
                break;
              case "gt":
                matches = val > compareValue;
                break;
              case "gte":
                matches = val >= compareValue;
                break;
            }
            break;
          }
          case "text":
            matches = String(itemValue).toLowerCase().includes(String(config.value).toLowerCase());
            break;
          default:
            matches = true;
        }
        return config.inverse ? !matches : matches;
      },
      [parsePrice],
    );

    const getAllObjects = useCallback(() => {
      const allObjects: Array<{ item: SimplifiedObject; rowName: string }> = [];

      selectedRowsData.forEach((row) => {
        if (filterByRows.size === 0 || filterByRows.has(row.title)) {
          row.objects.forEach((obj) => {
            // Apply header configs filters
            const matchesFilters = headerConfigs.every((config) => checkFilterMatch(obj, config));
            if (matchesFilters) {
              allObjects.push({ item: obj, rowName: row.title });
            }
          });
        }
      });

      return allObjects;
    }, [selectedRowsData, filterByRows, headerConfigs, checkFilterMatch]);

    const rollSingleItem = useCallback(() => {
      const allObjects = getAllObjects();
      if (allObjects.length === 0) return;

      const randomIndex = Math.floor(Math.random() * allObjects.length);
      const rolledItem = allObjects[randomIndex];
      setRolledItems([rolledItem]);
    }, [getAllObjects]);

    const rollMultipleItems = useCallback(() => {
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
    }, [getAllObjects, numRolls]);

    const handleRoll = useCallback(() => {
      if (numRolls === 1) {
        rollSingleItem();
      } else {
        rollMultipleItems();
      }
    }, [numRolls, rollSingleItem, rollMultipleItems]);

    const clearRolls = () => {
      setRolledItems([]);
    };

    // Helper to find name for ID (for passing to card)
    const lookupName = (id: string) => {
      const dataToSearch = fullCyoa || cyoaData;
      if (!dataToSearch) return id;

      // Search rows
      const row = dataToSearch.rows.find((r) => r.id === id);
      if (row) return row.title;

      // Search point types
      if (dataToSearch.pointTypes) {
        const pt = dataToSearch.pointTypes.find((p) => p.id === id);
        if (pt) return pt.name;
      }

      // Search objects and addons
      for (const r of dataToSearch.rows) {
        for (const obj of r.objects) {
          if (obj.id === id) return obj.title;
          if (obj.addons) {
            const addon = obj.addons.find((a) => a.id === id);
            if (addon) return addon.title;
          }
        }
      }

      return id;
    };

    const totalObjects = getAllObjects().length;

    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.shiftKey && e.key.toLowerCase() === "r") {
          handleRoll();
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }, [handleRoll]); // Added handleRoll dependency

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Roll Configuration</h3>
          <Button onClick={addHeaderConfig} variant="outline" size="sm">
            Add Filter
          </Button>
        </div>

        <div className="space-y-2">
          {headerConfigs.map((config, index) => (
            <div key={index}>
              <div className="flex flex-col gap-2 md:flex-row">
                <Select value={config.name} onValueChange={(value) => updateHeaderConfig(index, "name", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" className="w-full" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-col gap-2 md:flex-row">
                  <Select value={config.type} onValueChange={(value) => updateHeaderConfig(index, "type", value)}>
                    <SelectTrigger className="md:min-w-[100px] min-w-[100px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index">Numeric</SelectItem>
                      <SelectItem value="price">Price/Score</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>

                  {(config.type === "index" || config.type === "price") && (
                    <Select
                      value={config.comparison || "eq"}
                      onValueChange={(value) => updateHeaderConfig(index, "comparison", value)}
                    >
                      <SelectTrigger className="md:min-w-[120px] min-w-[100px]">
                        <SelectValue placeholder="Comparison" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lt">Less than (&lt;)</SelectItem>
                        <SelectItem value="lte">Less than or equal (&lt;=)</SelectItem>
                        <SelectItem value="eq">Equal to (=)</SelectItem>
                        <SelectItem value="gt">Greater than (&gt;)</SelectItem>
                        <SelectItem value="gte">Greater than or equal (&gt;=)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex gap-2">
                    <Input
                      type={config.type === "text" ? "text" : "number"}
                      placeholder={config.type === "price" ? "Value" : "Value"}
                      value={config.value || ""}
                      onChange={(e) => updateHeaderConfig(index, "value", e.target.value)}
                      disabled={!config.type}
                      className="md:min-w-[140px] min-w-[100px]"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={config.inverse ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => updateHeaderConfig(index, "inverse", (!config.inverse).toString())}
                            disabled={!config.type}
                            className="min-w-9"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Invert filter (NOT)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button variant="ghost" size="icon" onClick={() => removeHeaderConfig(index)} className="min-w-9">
                      <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </Button>
                  </div>
                </div>
              </div>
              {index < headerConfigs.length - 1 && <div className="h-px my-4 bg-border" />}
            </div>
          ))}
        </div>

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
              <Button variant="outline" className="justify-between w-48">
                <span className="truncate">
                  {filterByRows.size === 0
                    ? "All rows"
                    : filterByRows.size === 1
                      ? Array.from(filterByRows)[0]
                      : `${filterByRows.size} rows selected`}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 max-h-64 overflow-y-auto custom-scrollbar">
              <DropdownMenuItem
                onClick={() => setFilterByRows(new Set())}
                onSelect={(e) => e.preventDefault()}
                className="flex gap-2 items-center"
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
                  className="flex gap-2 items-center"
                >
                  <Checkbox checked={filterByRows.has(rowName)} />
                  <span className="truncate">{rowName}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleRoll} disabled={totalObjects === 0}>
                  Roll {numRolls > 1 ? `${numRolls} Items` : "Item"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Press Shift+R to roll</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
                  lookupName={lookupName}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);
