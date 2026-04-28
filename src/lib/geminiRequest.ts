import { getAI, EngineName } from "./aiRegistry";

export interface GeminiResponse {
  success: boolean;
  text: string;
  errorType: "FORBIDDEN" | "RATE_LIMITED" | "MODEL_MISSING" | "SERVER_ERROR" | "MISSING_KEY" | "NETWORK_TIMEOUT" | "EMPTY_RESPONSE" | "UNKNOWN" | null;
  modelUsed: string | null;
}

const FALLBACK_MODELS = [
  "gemini-3-flash",
  "gemini-2.5-flash",
  "gemini-1.5-pro"
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 🔥 THE FIX: In-memory cache to prevent duplicate rapid-fire requests
const requestCache = new Map<string, GeminiResponse>();

export async function geminiRequest(
  engine: EngineName, 
  prompt: string, 
  maxRetries = 2
): Promise<GeminiResponse> {
  
  // 1. Check if we already successfully answered this exact prompt recently
  const cacheKey = `${engine}_${prompt.trim()}`;
  if (requestCache.has(cacheKey)) {
    if (import.meta.env.DEV) console.log(`[Cache Hit] Returning saved real response for ${engine}`);
    return requestCache.get(cacheKey)!;
  }

  let aiClient;
  try {
    aiClient = getAI(engine);
  } catch (error) {
    return { success: false, text: "", errorType: "MISSING_KEY", modelUsed: null };
  }

  let attempt = 0;
  let baseDelay = 1500; // Increased delay to let Google breathe

  while (attempt <= maxRetries) {
    for (const modelName of FALLBACK_MODELS) {
      try {
        const model = aiClient.getGenerativeModel({ model: modelName });
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); 

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        
        clearTimeout(timeoutId);

        const text = result.response.text();
        if (!text || text.trim() === "") throw new Error("EMPTY_RESPONSE");

        const successfulResponse: GeminiResponse = { success: true, text, errorType: null, modelUsed: modelName };
        
        // 2. Save the successful, real response to the cache!
        requestCache.set(cacheKey, successfulResponse);
        
        return successfulResponse;

      } catch (error: any) {
        const msg = error.message?.toLowerCase() || error.name || "";
        let errorType: GeminiResponse["errorType"] = "UNKNOWN";
        
        if (msg.includes("abort") || msg.includes("timeout")) errorType = "NETWORK_TIMEOUT";
        else if (msg.includes("403") || msg.includes("api key not valid") || msg.includes("permission denied")) {
          return { success: false, text: "", errorType: "FORBIDDEN", modelUsed: modelName };
        } 
        else if (msg.includes("429") || msg.includes("quota")) errorType = "RATE_LIMITED";
        else if (msg.includes("404") || msg.includes("not found")) {
          errorType = "MODEL_MISSING";
          continue; 
        } 
        else if (msg.includes("500") || msg.includes("server error")) errorType = "SERVER_ERROR";
        else if (msg === "EMPTY_RESPONSE") errorType = "EMPTY_RESPONSE";

        if (errorType === "RATE_LIMITED" || errorType === "SERVER_ERROR" || errorType === "NETWORK_TIMEOUT") {
            if (attempt < maxRetries) {
                await sleep(baseDelay);
                baseDelay *= 2; 
                break; 
            } else {
                return { success: false, text: "", errorType, modelUsed: modelName };
            }
        }
      }
    }
    attempt++;
  }

  return { success: false, text: "", errorType: "UNKNOWN", modelUsed: null };
}