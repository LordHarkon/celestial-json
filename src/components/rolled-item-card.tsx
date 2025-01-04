import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type RolledItemCardProps = {
  item: Record<string, unknown>;
  sheetName: string;
};

export function RolledItemCard({ item, sheetName }: RolledItemCardProps) {
  const isError = "error" in item;

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
      <CardHeader>
        <CardTitle className="text-lg">Rolled Item from {sheetName}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          {Object.entries(item).map(([key, value]) => (
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
