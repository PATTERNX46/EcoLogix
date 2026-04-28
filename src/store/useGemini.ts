import { create } from 'zustand';
import { geminiRequest } from '../lib/geminiRequest'; // Adjust path if your lib folder is located elsewhere

interface GeminiState {
  isAnalyzing: boolean;
  analysisResult: string | null;
  runAnalysis: (nodeData: any) => Promise<void>;
  clearAnalysis: () => void;
}

export const useGemini = create<GeminiState>((set) => ({
  isAnalyzing: false,
  analysisResult: null,

  clearAnalysis: () => set({ analysisResult: null }),

  runAnalysis: async (nodeData) => {
    set({ isAnalyzing: true, analysisResult: null });
    
    const prompt = `You are the Resilio.OS AI Supply Chain Copilot. 
    Analyze the following intercepted network node telemetry:
    - Entity Name: ${nodeData.name}
    - Infrastructure Type: ${nodeData.type}
    - Current Status/Risk Level: ${nodeData.risk || nodeData.status}

    Provide a highly professional, 2-to-3 sentence urgent action plan to mitigate supply chain disruption at this specific node. 
    Use enterprise logistics terminology (e.g., rerouting, multimodal transport, capacity throttling). Do not use formatting like bolding or asterisks.`;

    try {
      // Route through the centralized multi-engine architecture
      const response = await geminiRequest("copilot", prompt);

      if (response.success) {
        // Pure, live AI response
        set({ 
          analysisResult: response.text, 
          isAnalyzing: false 
        });
      } else {
        // STRICT ERROR HANDLING - NO FALLBACK DATA
        let errorText = "CONNECTION FAILED: Neural Engine offline.";
        
        switch (response.errorType) {
          case "FORBIDDEN": 
            errorText = "ERROR 403: Copilot API Key is restricted or invalid. Check AI Registry."; 
            break;
          case "RATE_LIMITED": 
            errorText = "ERROR 429: Rate limit exceeded for Copilot engine. Please wait 60 seconds."; 
            break;
          case "MISSING_KEY": 
            errorText = "ERROR: Copilot engine key missing from environment variables."; 
            break;
          case "NETWORK_TIMEOUT": 
            errorText = "ERROR: Network timeout connecting to Gemini matrix."; 
            break;
          case "SERVER_ERROR": 
            errorText = "ERROR 500: Google AI servers are currently experiencing issues."; 
            break;
          case "EMPTY_RESPONSE":
            errorText = "ERROR: AI Engine returned an empty response format.";
            break;
        }

        set({ 
          analysisResult: errorText, 
          isAnalyzing: false 
        });
      }
    } catch (error) {
      console.error("[Neural Engine] Critical execution failure:", error);
      set({ 
        analysisResult: "CRITICAL ERROR: Failed to execute Copilot analysis sequence.", 
        isAnalyzing: false 
      });
    }
  }
}));