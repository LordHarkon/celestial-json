import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RolledItemCardProps = {
  item: Record<string, unknown>;
  sheetName: string;
};

export function RolledItemCard({ item, sheetName }: RolledItemCardProps) {
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
