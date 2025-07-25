import { forwardRef, useState, useEffect, useCallback, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { JsonData, HeaderConfig, HeaderType, Settings } from "@/types/excel";
import { RolledItemCard } from "./rolled-item-card";
import { X, Ban } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type RollingMenuProps = {
  jsonData: JsonData;
  settings?: Settings;
  onKeepItem?: (item: { item: Record<string, unknown>; sheetName: string }) => void;
  keptItems?: Array<{ item: Record<string, unknown>; sheetName: string }>;
  setKeptItems?: (items: Array<{ item: Record<string, unknown>; sheetName: string }>) => void;
};

export type RollingMenuRef = {
  getHeaderConfigs: () => HeaderConfig[];
  setHeaderConfigs: (configs: HeaderConfig[]) => void;
};

export const RollingMenu = forwardRef<RollingMenuRef, RollingMenuProps>(
  ({ jsonData, settings, onKeepItem, keptItems, setKeptItems }, ref) => {
    const [headerConfigs, setHeaderConfigs] = useState<HeaderConfig[]>([]);
    const [rolledItem, setRolledItem] = useState<{ item: Record<string, unknown>; sheetName: string } | null>(null);

    const allHeaders = new Set<string>();
    jsonData.forEach((sheet) => {
      if (sheet.data[0]) {
        Object.keys(sheet.data[0])
          .filter((header) => header !== "_id")
          .forEach((header) => allHeaders.add(header));
      }
    });

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

    const handleRoll = useCallback(() => {
      const filteredData = jsonData.flatMap((sheet) =>
        sheet.data
          .filter((item: Record<string, string | number | null>) => {
            // Check if item has more than just an ID or index
            const hasContent = Object.entries(item).some(([key, value]: [string, string | number | null]) => {
              if (!value) return false;
              // Skip if it's just an ID/index field
              if (key.toLowerCase().includes("id") || key === "0") return false;
              return true;
            });

            if (!hasContent) return false;

            return headerConfigs.every((config) => {
              if (!config.name || !config.type || (typeof config.value != "number" && !config.value)) return true;
              const value = item[config.name];
              if (typeof value != "number" && !value) return false;

              let matches = false;
              switch (config.type) {
                case "index":
                case "price": {
                  const itemValue = config.type === "price" ? parsePrice(value) : parseInt(value as string, 10);
                  const compareValue = parseInt(config.value as string, 10);

                  switch (config.comparison || "eq") {
                    case "lt":
                      matches = itemValue < compareValue;
                      break;
                    case "lte":
                      matches = itemValue <= compareValue;
                      break;
                    case "eq":
                      matches = itemValue === compareValue;
                      break;
                    case "gt":
                      matches = itemValue > compareValue;
                      break;
                    case "gte":
                      matches = itemValue >= compareValue;
                      break;
                  }
                  break;
                }
                case "text":
                  matches = String(value).toLowerCase().includes(String(config.value).toLowerCase());
                  break;
                default:
                  matches = true;
              }
              return config.inverse ? !matches : matches;
            });
          })
          .map((item) => ({ item, sheetName: sheet.sheetName })),
      );

      if (filteredData.length === 0) {
        setRolledItem({ item: { error: "No items found matching your filters." }, sheetName: "Error" });
        return;
      }

      const randomRoll = filteredData[Math.floor(Math.random() * filteredData.length)];
      setRolledItem(randomRoll);
    }, [jsonData, headerConfigs]);

    const parsePrice = (price: string | number): number => {
      if (typeof price === "number") return price;
      if (price.toLowerCase() === "free") return 0;
      const numMatch = price.match(/\d+/);
      return numMatch ? parseInt(numMatch[0], 10) : 0;
    };

    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.shiftKey && e.key.toLowerCase() === "r") {
          handleRoll();
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }, [handleRoll]);

    useImperativeHandle(ref, () => ({
      getHeaderConfigs: () => headerConfigs,
      setHeaderConfigs: (configs: HeaderConfig[]) => setHeaderConfigs(configs),
    }));

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
                    <SelectValue placeholder="Select header" className="w-full" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(allHeaders).map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-col gap-2 md:flex-row">
                  <Select value={config.type} onValueChange={(value) => updateHeaderConfig(index, "type", value)}>
                    <SelectTrigger className="md:min-w-[100px] min-w-[100px]">
                      <SelectValue placeholder="Header type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index">Index</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
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
                      placeholder={config.type === "price" ? "Price" : "Value"}
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleRoll} variant="outline" className="w-full">
                🎲 Roll Perk
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Press Shift+R to roll</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {rolledItem && (
          <RolledItemCard
            item={rolledItem.item}
            sheetName={rolledItem.sheetName}
            hiddenHeaders={new Set(settings?.hiddenHeaders ?? [])}
            onKeep={() => onKeepItem?.(rolledItem)}
            isKept={keptItems?.some(
              (kept) =>
                kept.sheetName === rolledItem.sheetName &&
                JSON.stringify(kept.item) === JSON.stringify(rolledItem.item),
            )}
            onRemove={() => {
              if (keptItems && setKeptItems) {
                setKeptItems(keptItems.filter((kept) => (kept.item._id as string) !== (rolledItem.item._id as string)));
              }
            }}
          />
        )}
      </div>
    );
  },
);
