import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { JsonData, HeaderConfig, HeaderType } from "@/types/excel";
import { RolledItemCard } from "./rolled-item-card";
import { X } from "lucide-react";

type RollingMenuProps = {
  jsonData: JsonData;
};

export function RollingMenu({ jsonData }: RollingMenuProps) {
  const [headerConfigs, setHeaderConfigs] = useState<HeaderConfig[]>([]);
  const [rolledItem, setRolledItem] = useState<{ item: Record<string, unknown>; sheetName: string } | null>(null);

  const allHeaders = new Set<string>();
  jsonData.forEach((sheet) => {
    if (sheet.data[0]) {
      Object.keys(sheet.data[0]).forEach((header) => allHeaders.add(header));
    }
  });

  const addHeaderConfig = () => {
    setHeaderConfigs([...headerConfigs, { name: "", type: "text" }]);
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

  const handleRoll = () => {
    const filteredData = jsonData.flatMap((sheet) =>
      sheet.data
        .filter((item) => {
          return headerConfigs.every((config) => {
            const value = item[config.name];
            if (!value || !config.value) return true;

            switch (config.type) {
              case "index":
                return Number(value) === Number(config.value);
              case "price": {
                const itemPrice = parsePrice(String(value));
                return itemPrice === Number(config.value);
              }
              case "text":
                return String(value).toLowerCase().includes(String(config.value).toLowerCase());
              default:
                return true;
            }
          });
        })
        .map((item) => ({ item, sheetName: sheet.sheetName })),
    );

    if (filteredData.length === 0) {
      setRolledItem(null);
      return;
    }

    const randomRoll = filteredData[Math.floor(Math.random() * filteredData.length)];
    setRolledItem(randomRoll);
  };

  const parsePrice = (price: string): number => {
    if (price.toLowerCase() === "free") return 0;
    const numMatch = price.match(/\d+/);
    return numMatch ? Number(numMatch[0]) : 0;
  };

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
          <div key={index} className="flex gap-2">
            <Select value={config.name} onValueChange={(value) => updateHeaderConfig(index, "name", value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select header" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(allHeaders).map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={config.type} onValueChange={(value) => updateHeaderConfig(index, "type", value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="index">Index</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Value"
              value={config.value || ""}
              onChange={(e) => updateHeaderConfig(index, "value", e.target.value)}
              className="w-[200px]"
            />

            <Button variant="ghost" size="icon" onClick={() => removeHeaderConfig(index)}>
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={handleRoll} className="w-full">
        🎲 Roll Item
      </Button>

      {rolledItem && <RolledItemCard item={rolledItem.item} sheetName={rolledItem.sheetName} />}
    </div>
  );
}
