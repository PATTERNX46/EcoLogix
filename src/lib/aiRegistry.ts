import { GoogleGenerativeAI } from "@google/generative-ai";

export type EngineName = 
  | "copilot" | "alerting" | "optimizer" | "warehouse" 
  | "supplier" | "risk" | "carbon" | "fleet" 
  | "fraud" | "blockchain" | "route" | "coldchain" 
  | "disaster" | "digitalTwin" | "government" | "analytics" | "livemap";

export const AI_KEYS: Record<EngineName, string | undefined> = {
  copilot: import.meta.env.VITE_GEMINI_COPILOT,
  alerting: import.meta.env.VITE_GEMINI_ALERTING,
  optimizer: import.meta.env.VITE_GEMINI_OPTIMIZER,
  warehouse: import.meta.env.VITE_GEMINI_WAREHOUSE,
  supplier: import.meta.env.VITE_GEMINI_SUPPLIER,
  risk: import.meta.env.VITE_GEMINI_RISK,
  carbon: import.meta.env.VITE_GEMINI_CARBON,
  fleet: import.meta.env.VITE_GEMINI_FLEET,
  fraud: import.meta.env.VITE_GEMINI_FRAUD,
  blockchain: import.meta.env.VITE_GEMINI_BLOCKCHAIN,
  route: import.meta.env.VITE_GEMINI_ROUTE,
  coldchain: import.meta.env.VITE_GEMINI_COLDCHAIN,
  disaster: import.meta.env.VITE_GEMINI_DISASTER,
  digitalTwin: import.meta.env.VITE_GEMINI_TWIN,
  government: import.meta.env.VITE_GEMINI_GOV,
  analytics: import.meta.env.VITE_GEMINI_ANALYTICS,
  livemap: import.meta.env.VITE_GEMINI_LIVEMAP,
};

const clientCache = new Map<EngineName, GoogleGenerativeAI>();

export function getAI(engine: EngineName): GoogleGenerativeAI {
  if (clientCache.has(engine)) {
    return clientCache.get(engine)!;
  }

  let key = AI_KEYS[engine];

  if (!key || key.trim() === "") {
    if (import.meta.env.DEV) {
      console.error(`[Resilio AI Registry] ❌ Missing API key for engine: ${engine}`);
    }
    throw new Error(`MISSING_KEY`);
  }

  key = key.trim();
  const client = new GoogleGenerativeAI(key);
  clientCache.set(engine, client);
  
  if (import.meta.env.DEV) {
    console.log(`[Resilio AI Registry] ✅ Engine initialized: ${engine}`);
  }
  
  return client;
}