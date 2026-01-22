import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, RotateCcw } from "lucide-react";
import type { SimplifiedObject, SimplifiedRequirement } from "@/types/cyoa";

type CyoaRolledItemCardProps = {
  item: SimplifiedObject;
  rowName: string;
  onKeepItem?: (item: { item: SimplifiedObject; rowName: string }) => void;
  onRollAgain?: () => void;
  isKept?: boolean;
  lookupName?: (id: string) => string;
};

export function CyoaRolledItemCard({
  item,
  rowName,
  onKeepItem,
  onRollAgain,
  isKept = false,
  lookupName,
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

  const getRequirementText = (req: SimplifiedRequirement) => {
    let name = "Unknown";

    if (req.type === "id" && req.reqId) {
      name = lookupName ? lookupName(req.reqId) : req.reqId || "Unknown";
    } else if (req.type === "or" && req.orRequired) {
      name = req.orRequired.map((r) => (lookupName ? lookupName(r.req) : r.req)).join(" OR ");
      if (req.orRequired.length > 1) name = `(${name})`;
    } else if (req.type === "points") {
      name = `${req.reqPoints} Points`;
    } else {
      name = req.reqId || "Unknown";
    }

    return name;
  };

  return (
    <Card className={`transition-all ${isKept ? "bg-green-900 border-green-500" : ""}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <div className="flex flex-wrap gap-2 items-center mt-1">
              <Badge variant="secondary" className="bg-black border border-white/10">
                {rowName}
              </Badge>
              {isKept && (
                <Badge variant="default" className="bg-green-500">
                  Kept
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {item.scores?.map((score, idx) => {
                const val = parseInt(score.value);
                const displayVal = isNaN(val) ? score.value : Math.abs(val);
                if (!score.beforeText && !score.afterText) return null;

                let reqString = "";
                if (score.requireds && score.requireds.length > 0) {
                  const selectedNames: string[] = [];
                  const unselectedNames: string[] = [];

                  score.requireds.forEach((req) => {
                    let name = getRequirementText(req);

                    // Use beforeText and afterText if present
                    const parts = [name].filter(Boolean);
                    name = parts.join(" ");

                    if (req.required !== false) {
                      selectedNames.push(name);
                    } else {
                      unselectedNames.push(name);
                    }
                  });

                  const parts = [];
                  if (selectedNames.length > 0) {
                    parts.push(`${selectedNames.join(", ")} selected`);
                  }
                  if (unselectedNames.length > 0) {
                    parts.push(`${unselectedNames.join(", ")} unselected`);
                  }

                  if (parts.length > 0) {
                    reqString = `If ${parts.join(" and ")}`;
                  }
                }

                return (
                  <div key={`${score.id}-${idx}`} className="flex flex-col items-start gap-1">
                    <Badge variant="outline" className="border-yellow-600/50 text-yellow-500">
                      {score.beforeText} {displayVal} {score.afterText}{" "}
                      {reqString && <span className="text-xs text-muted-foreground ml-1">{reqString}</span>}
                    </Badge>
                  </div>
                );
              })}
            </div>
            {item.requireds && item.requireds.length > 0 && (
              <>
                {item.requireds.map((req, idx) => {
                  const reqText = getRequirementText(req);
                  return (
                    <Badge key={`${req.id}-${idx}`} className="border-red-600/50 text-red-500" variant="outline">
                      {[req.beforeText, reqText, req.afterText].filter(Boolean).join(" ")}
                    </Badge>
                  );
                })}
                {/* <div className="p-3 mt-2 text-sm rounded-md bg-muted/50">
                  <span className="font-semibold text-red-400">Requirements:</span>
                  <ul className="mt-1 ml-4 list-disc list-outside text-muted-foreground">
                    {item.requireds.map((req, idx) => {
                      const reqText = getRequirementText(req);
                      return (
                        <li key={`${req.id}-${idx}`}>
                          {[req.beforeText, reqText, req.afterText].filter(Boolean).join(" ")}
                        </li>
                      );
                    })}
                  </ul>
                </div> */}
              </>
            )}
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
                  {addon.requireds && addon.requireds.length > 0 && (
                    <div className="mt-1 text-xs text-red-400">
                      {addon.requireds.map((req, idx) => {
                        const reqText = getRequirementText(req);
                        return (
                          <div key={idx}>{[req.beforeText, reqText, req.afterText].filter(Boolean).join(" ")}</div>
                        );
                      })}
                    </div>
                  )}
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
