import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CELESTIAL_FILES = [
  { name: "Celestial Dojo", path: "dojo - 04-01-2025.xlsx" },
  { name: "Celestial Forge v3", path: "forge v3 - 04-01-2025.xlsx" },
  { name: "Celestial Grimoire", path: "grimoire - 04-01-2025.xlsx" },
  { name: "Celestial Grimoire Yggdrasil v2.5", path: "grimoire yggdrasil v2.5 - 04-01-2025.xlsx" },
  { name: "Celestial Reliquary", path: "reliquary - 04-01-2025.xlsx" },
];

type FileSelectorProps = {
  onFileSelect: (path: string) => void;
};

export function FileSelector({ onFileSelect }: FileSelectorProps) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">Select a Celestial Document</label>
      <Select onValueChange={onFileSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a CYOA..." />
        </SelectTrigger>
        <SelectContent>
          {CELESTIAL_FILES.map((file) => (
            <SelectItem key={file.path} value={file.path}>
              {file.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-xs text-muted-foreground">Note: These files are updated as of Jan 4, 2025.</span>
    </div>
  );
}
