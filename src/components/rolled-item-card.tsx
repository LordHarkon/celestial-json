import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Copy, BookmarkPlus, X } from "lucide-react";
import { Button } from "./ui/button";

type RolledItemCardProps = {
  item: Record<string, unknown>;
  sheetName: string;
  hiddenHeaders: Set<string>;
  onKeep?: () => void;
  isKept?: boolean;
  onRemove?: (id: string) => void;
};

export function RolledItemCard({ item, sheetName, hiddenHeaders, onKeep, isKept, onRemove }: RolledItemCardProps) {
  const isError = "error" in item;

  const handleCopy = () => {
    const text = Object.entries(item)
      .filter(([key]) => !hiddenHeaders.has(key))
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardHeader className="flex flex-row items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <CardTitle className="text-lg">{String(item.error)}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Rolled Item from {sheetName}</CardTitle>
        <div className="flex gap-2">
          {isKept ? (
            <Button variant="outline" size="icon" onClick={() => onRemove?.(item._id as string)}>
              <X className="w-4 h-4" />
            </Button>
          ) : (
            onKeep && (
              <Button variant="outline" size="icon" onClick={onKeep}>
                <BookmarkPlus className="w-4 h-4" />
              </Button>
            )
          )}
          <Button variant="outline" size="icon" onClick={handleCopy}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          {Object.entries(item)
            .filter(([key]) => !hiddenHeaders.has(key))
            .map(([key, value]) => (
              <div key={key} className="flex flex-col space-y-1">
                <span className="font-medium">{key}:</span>
                <span className="whitespace-pre text-muted-foreground text-wrap">{String(value)}</span>
              </div>
            ))}
        </dl>
      </CardContent>
    </Card>
  );
}
