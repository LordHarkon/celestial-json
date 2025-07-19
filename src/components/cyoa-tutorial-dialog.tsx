import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export function CyoaTutorialDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="w-4 h-4" />
          Tutorial
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>How to Use the CYOA Roller</DialogTitle>
          <DialogDescription className="space-y-4 text-left">
            <div>
              <h3 className="mb-2 font-semibold underline">1. Loading CYOA Data</h3>
              <p>• Select from predefined CYOA URLs or enter a custom URL</p>
              <p>• Upload your own CYOA JSON file from your computer</p>
              <p>• Only JSON files are supported</p>
              <p>• You can import/export your state to save your settings and kept items</p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold underline">2. Row Selection</h3>
              <p>• Choose which rows contain objects you want to roll from</p>
              <p>• You can rename rows and view their objects</p>
              <p>• Use "Select All" to quickly select or deselect all rows</p>
              <p>• Expand rows to see all available objects inside them</p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold underline">3. Rolling Objects</h3>
              <p>• Set the number of items to roll (1-20)</p>
              <p>• Filter by specific rows to narrow your selection</p>
              <p>• Multiple rows can be selected in the filter for combined rolling</p>
              <p>• Click "Roll Items" to randomly select objects from your chosen rows</p>
              <p>• Each roll avoids duplicates when rolling multiple items</p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold underline">4. Managing Rolled Items</h3>
              <p>• View detailed information about each rolled object</p>
              <p>• Objects show their title, description, image, and any addons</p>
              <p>• Keep items you like by clicking "Keep" on the rolled item card</p>
              <p>• Roll again to get new results while keeping your current selection</p>
              <p>• Clear all rolls to start fresh</p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold underline">5. Building Your Collection</h3>
              <p>• View your kept items in the "Kept Items" dialog</p>
              <p>• Remove items you no longer want from your collection</p>
              <p>• Export your complete state to save your configuration and kept items</p>
              <p>• Import previously saved states to restore your setup</p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
