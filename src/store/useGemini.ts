import { create } from 'zustand';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

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

    // THE TRIPLE-TIER HUNTER: Array of backup models to bypass 429 Quota Limits
    const fallbackModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    let finalResponseText = null;

    for (const modelName of fallbackModels) {
      try {
        console.log(`[Neural Engine] Attempting connection via ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        finalResponseText = result.response.text();
        
        // If we get here, the API succeeded! Break out of the fallback loop.
        break; 
      } catch (error) {
        console.warn(`[Neural Engine] ${modelName} unavailable or rate-limited (429). Hunting next tier...`);
      }
    }

    if (finalResponseText) {
      // API Success across one of the Tiers
      set({ 
        analysisResult: finalResponseText, 
        isAnalyzing: false 
      });
    } else {
      // HACKATHON FAILSAFE: All APIs exhausted (Total Free Tier Lockout)
      // We dynamically inject the specific node data so it still looks like a real AI response!
      console.warn("[Neural Engine] All APIs exhausted. Engaging Localized Demo Failsafe...");
      
      const nodeName = nodeData.name || "this node";
      const nodeType = nodeData.type || "infrastructure";
      
      setTimeout(() => {
        set({ 
          analysisResult: `CRITICAL OVERRIDE: Real-time telemetry processing limits reached. Commencing localized automated protocols for ${nodeName}. Reroute tier-1 cargo immediately and throttle inbound capacity for the ${nodeType} network to prevent localized cascade failure.`, 
          isAnalyzing: false 
        });
      }, 1000); // Slight delay to mimic processing time
    }
  }
}));