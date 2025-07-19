import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useState } from "react";
import { CelestialTab } from "@/components/celestial-tab";
import { CyoaTab } from "@/components/cyoa-tab";

function App() {
  const [activeTab, setActiveTab] = useState("celestial");

  return (
    <div className="flex justify-center items-center p-2 min-h-screen bg-gradient-to-b sm:p-4 from-background to-muted">
      <Card className="overflow-hidden w-full max-w-2xl shadow-lg">
        <CardHeader className="relative">
          <ThemeSwitcher />

          {/* Tabs positioned in upper right corner */}
          <div className="absolute top-2 right-4 z-10">
            <div className="flex p-1 rounded-lg bg-muted">
              <button
                onClick={() => setActiveTab("celestial")}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "celestial"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Celestial
              </button>
              <button
                onClick={() => setActiveTab("cyoa")}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "cyoa"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                CYOA
              </button>
            </div>
          </div>

          <CardTitle className="pt-8 text-2xl font-bold text-center">
            {activeTab === "celestial" ? "Celestial Roller" : "CYOA Roller"}
          </CardTitle>
          <CardDescription className="text-center">
            {activeTab === "celestial"
              ? "A specialized tool for Celestial spreadsheets. Load Excel files and use the roller to randomly select items based on filters. You can customize sheet names and standardize headers across sheets."
              : "Load CYOA JSON files and roll options based on your filters."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeTab === "celestial" && <CelestialTab />}
          {activeTab === "cyoa" && <CyoaTab />}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
