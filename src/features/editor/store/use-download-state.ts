import { IDesign } from "@designcombo/types";
import { create } from "zustand";
interface Output {
  url: string;
  type: string;
}

interface DownloadState {
  projectId: string;
  exporting: boolean;
  exportType: "json" | "mp4";
  progress: number;
  output?: Output;
  payload?: IDesign;
  displayProgressModal: boolean;
  actions: {
    setProjectId: (projectId: string) => void;
    setExporting: (exporting: boolean) => void;
    setExportType: (exportType: "json" | "mp4") => void;
    setProgress: (progress: number) => void;
    setState: (state: Partial<DownloadState>) => void;
    setOutput: (output: Output) => void;
    startExport: () => void;
    setDisplayProgressModal: (displayProgressModal: boolean) => void;
  };
}

//const baseUrl = "https://api.combo.sh/v1";

export const useDownloadState = create<DownloadState>((set, get) => ({
  projectId: "",
  exporting: false,
  exportType: "mp4",
  progress: 0,
  displayProgressModal: false,
  actions: {
    setProjectId: (projectId) => set({ projectId }),
    setExporting: (exporting) => set({ exporting }),
    setExportType: (exportType) => set({ exportType }),
    setProgress: (progress) => set({ progress }),
    setState: (state) => set({ ...state }),
    setOutput: (output) => set({ output }),
    setDisplayProgressModal: (displayProgressModal) =>
      set({ displayProgressModal }),
    startExport: async () => {
      try {
        // Set exporting to true at the start
        set({ exporting: true, displayProgressModal: true, progress: 0 });

        // Get payload and export type
        const { payload, exportType } = get();

        if (!payload) throw new Error("Payload is not defined");

        // Handle JSON export
        if (exportType === "json") {
          console.log("Exporting as JSON");
          
          // Create JSON blob and download
          const jsonString = JSON.stringify(payload, null, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          
          // Create download link
          const link = document.createElement("a");
          link.href = url;
          link.download = `design-${Date.now()}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up
          URL.revokeObjectURL(url);
          
          // Set output
          set({
            output: {
              url: "",
              type: "json"
            },
            progress: 100,
            exporting: false,
            displayProgressModal: false
          });
          
          return;
        }

        // Handle MP4 export (existing logic)
        console.log("About to send payload to render API:");
        console.log("- trackItemIds:", payload.trackItemIds);
        console.log("- trackItemsMap keys:", Object.keys(payload.trackItemsMap || {}));
        if (payload.trackItemIds && payload.trackItemIds.length > 0) {
          const firstId = payload.trackItemIds[0];
          const firstItem = payload.trackItemsMap[firstId];
          console.log("- First trackItem ID:", firstId);
          console.log("- First trackItem:", firstItem);
          console.log("- Has display?", !!firstItem?.display);
          console.log("- Has trim?", !!firstItem?.trim);
          console.log("- Display value:", firstItem?.display);
          console.log("- Trim value:", firstItem?.trim);
        }

        // Step 1: POST request to start rendering locally
        const response = await fetch(`/api/render/local`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            design: payload,
            composition: {
              id: "MainComposition",
              fps: 30,
              width: payload.size?.width || 1080,
              height: payload.size?.height || 1920,
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Render API error:", errorData);
          throw new Error(errorData.details || errorData.error || "Failed to render video");
        }

        const result = await response.json();

        // Local rendering completes in one step
        set({ 
          exporting: false, 
          progress: 100,
          output: { url: result.url, type: get().exportType }
        });

      } catch (error) {
        console.error("Render error:", error);
        set({ exporting: false, progress: 0 });
        alert(error instanceof Error ? error.message : "Failed to render video");
      }
    }
  }
}));
