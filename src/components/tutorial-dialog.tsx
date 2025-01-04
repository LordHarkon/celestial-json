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

export function TutorialDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="absolute top-2.5 left-14">
          <HelpCircle className="w-4 h-4" />
          <span className="sr-only">Tutorial</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>How to Use the Celestial Roller</DialogTitle>
          <DialogDescription className="space-y-4 text-left">
            <div>
              <h3 className="mb-2 font-semibold underline">1. Loading Data</h3>
              <p>• Select from pre-loaded Celestial documents or upload your own Excel file</p>
              <p>• Only .xlsx and .xls files are supported</p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold underline">2. Sheet Selection</h3>
              <p>• Choose which sheets contain perks (usually starting from Chapter 1)</p>
              <p>• You can rename sheets and view their headers</p>
              <p>• Use "Select All" to quickly select or deselect all sheets</p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold underline">3. Header Management</h3>
              <p>• Use the settings icon to standardize headers across sheets</p>
              <p>
                • Similar headers can be merged by giving them the same name (just keep in mind that you will not be
                able to split them back, unless you upload the file again)
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold underline">4. Rolling Items</h3>
              <p>• Add filters to narrow down your roll results</p>
              <p>• Filter types:</p>
              <ul className="pl-4 list-disc list-inside">
                <li>Text: Searches for matching text in the field</li>
                <li>Index: Matches exact numbers</li>
                <li>Price: Matches CP cost (handles "Free" as 0)</li>
              </ul>
              <p>• Click "Roll Item" to randomly select an item matching your filters</p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
