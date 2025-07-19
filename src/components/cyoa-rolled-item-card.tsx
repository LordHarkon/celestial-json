import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, RotateCcw } from "lucide-react";
import type { SimplifiedObject } from "@/types/cyoa";

type CyoaRolledItemCardProps = {
  item: SimplifiedObject;
  rowName: string;
  onKeepItem?: (item: { item: SimplifiedObject; rowName: string }) => void;
  onRollAgain?: () => void;
  isKept?: boolean;
};

export function CyoaRolledItemCard({
  item,
  rowName,
  onKeepItem,
  onRollAgain,
  isKept = false,
}: CyoaRolledItemCardProps) {
  const renderImage = (imageUrl?: string, imageIsURL?: boolean, imageLink?: string) => {
    if (!imageUrl && !imageLink) return null;

    const src = imageIsURL ? imageLink || imageUrl : imageUrl;
    if (!src) return null;

    return (
      <img
        src={src}
        alt={item.title}
        className="object-cover w-full h-48 rounded-md"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  };

  const handleKeepItem = () => {
    if (onKeepItem) {
      onKeepItem({ item, rowName });
    }
  };

  return (
    <Card className={`transition-all ${isKept ? "bg-green-900 border-green-500" : ""}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription className="flex gap-2 items-center">
              <Badge variant="secondary" className="bg-black border border-white/10">
                {rowName}
              </Badge>
              {isKept && (
                <Badge variant="default" className="bg-green-500">
                  Kept
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onKeepItem && !isKept && (
              <Button variant="outline" size="sm" onClick={handleKeepItem} className="flex gap-1 items-center">
                <Heart className="w-4 h-4" />
                Keep
              </Button>
            )}
            {onRollAgain && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRollAgain}
                disabled={isKept}
                className="flex gap-1 items-center"
              >
                <RotateCcw className="w-4 h-4" />
                Roll Again
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderImage(item.image, item.imageIsURL, item.imageLink)}

        {item.text && (
          <div>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{item.text}</p>
          </div>
        )}

        {item.addons && item.addons.length > 0 && (
          <div>
            <h4 className="mb-2 font-medium">Addons:</h4>
            <div className="space-y-2">
              {item.addons.map((addon) => (
                <div key={addon.id} className="pl-4 border-l-2 border-gray-200">
                  <h5 className="text-sm font-medium">{addon.title}</h5>
                  {addon.text && <p className="mt-1 text-xs text-gray-400">{addon.text}</p>}
                  {renderImage(addon.image, addon.imageIsURL, addon.imageLink)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
