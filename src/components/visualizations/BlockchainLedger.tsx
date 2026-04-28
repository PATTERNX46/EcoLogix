import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Search, Link as LinkIcon, FileText, 
  ThermometerSnowflake, Route, CheckCircle2, 
  AlertTriangle, RefreshCw, Stamp, Fingerprint, ServerCrash,
  Box, Cpu
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "PASTE_YOUR_API_KEY_HERE";

interface BlockEvent {
  id: string;
  timestamp: string;
  blockHash: string;
  type: 'Ownership' | 'Route' | 'Customs' | 'Invoice' | 'ColdChain' | 'AntiCounterfeit';
  description: string;
  verifiedBy: string;
  status: 'Verified' | 'Flagged';
}

interface LedgerData {
  shipmentId: string;
  networkStatus: string;
  contractAddress: string;
  totalGasUsed: string;
  blocks: BlockEvent[];
}

export default function BlockchainLedger() {
  const [searchQuery, setSearchQuery] = useState('SHP-9924-X');
  const [isAuditing, setIsAuditing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [ledgerData, setLedgerData] = useState<LedgerData | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);

  const runDemoAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsAuditing(true);
    setSystemError(null);
    setLedgerData(null);

    setLoadingStep('Connecting to Resilio RPC Node...');
    await new Promise(r => setTimeout(r, 800));
    setLoadingStep('Verifying Smart Contract ABI...');
    await new Promise(r => setTimeout(r, 800));
    setLoadingStep(`Querying Distributed Ledger for ${searchQuery}...`);

    const prompt = `You are a Web3 Smart Contract Simulator.
    Generate a cryptographic timeline ledger for Shipment ID: "${searchQuery}".
    
    You MUST include exactly 6 chronological block events in this specific order:
    1. Shipment Ownership (type: "Ownership")
    2. Invoice Authenticity (type: "Invoice")
    3. Anti-Counterfeit Verification (type: "AntiCounterfeit")
    4. Route Change/Optimization (type: "Route")
    5. Cold Chain Certificate (type: "ColdChain") - Invent a realistic temperature reading.
    6. Customs Stamp (type: "Customs")

    Return EXACTLY a raw JSON object (no markdown, no backticks) with this structure:
    {
      "shipmentId": "${searchQuery}",
      "networkStatus": "Secured via Proof-of-Authority",
      "contractAddress": "0x followed by 40 random hex characters",
      "totalGasUsed": "0.0042 ETH (or similar realistic number)",
      "blocks": [
        {
          "id": "block-1",
          "timestamp": "YYYY-MM-DD HH:MM:SS",
          "blockHash": "0x followed by 16 random hex characters",
          "type": "Ownership" | "Invoice" | "AntiCounterfeit" | "Route" | "ColdChain" | "Customs",
          "description": "A highly technical 1-sentence description of the ledger entry.",
          "verifiedBy": "0x followed by 12 random hex chars",
          "status": "Verified"
        }
      ]
    }`;

    let attempt = 0;
    let success = false;
    let currentWaitTime = 2000;
    
    // THE CUTTING-EDGE MODEL WATERFALL: Only using 2.5 and 2.0 architecture
    const fallbackModels = [
      'gemini-2.5-flash', 
      'gemini-2.0-flash', 
      'gemini-2.0-flash-exp' // Experimental 2.0 fallback just in case
    ];

    while (attempt < 3 && !success) {
      try {
        let response;
        for (const model of fallbackModels) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          
          // If the model exists (not a 404), break the loop and use this response
          if (response.status !== 404) break; 
        }
        // ... (rest of the while loop stays exactly the same)

        if (!response) throw new Error("All endpoints failed");

        if (response.status === 429) {
          attempt++;
          setLoadingStep(`RPC Congestion. Retrying Block Verification...`);
          await new Promise(r => setTimeout(r, currentWaitTime));
          currentWaitTime += 2000;
          continue;
        }

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("JSON Parse Error");

        const parsedData: LedgerData = JSON.parse(jsonMatch[0]);
        setLedgerData(parsedData);
        success = true;

      } catch (error) {
        attempt++;
        setLoadingStep(`Consensus Failure. Re-syncing Node...`);
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    if (!success) {
      console.warn("API request failed. Injecting offline demo data for presentation continuity...");
      setSystemError(null); 
      
      setLedgerData({
        shipmentId: searchQuery,
        networkStatus: "Secured via Proof-of-Authority",
        contractAddress: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
        totalGasUsed: "0.0042 ETH",
        blocks: [
          {
            id: "block-1",
            timestamp: new Date(Date.now() - 172800000).toISOString().replace('T', ' ').substring(0, 19),
            blockHash: "0x9d3b4a2e1f0c8d6e",
            type: "Ownership",
            description: "Title transferred to primary logistics carrier.",
            verifiedBy: "0x3aF...91C",
            status: "Verified"
          },
          {
            id: "block-2",
            timestamp: new Date(Date.now() - 150000000).toISOString().replace('T', ' ').substring(0, 19),
            blockHash: "0x1a2b3c4d5e6f7a8b",
            type: "Invoice",
            description: "Commercial invoice cryptographically signed.",
            verifiedBy: "0x7bE...22A",
            status: "Verified"
          },
          {
            id: "block-3",
            timestamp: new Date(Date.now() - 120000000).toISOString().replace('T', ' ').substring(0, 19),
            blockHash: "0x8f7e6d5c4b3a2109",
            type: "AntiCounterfeit",
            description: "NFC tag signature verified against manufacturer registry.",
            verifiedBy: "0x91D...44F",
            status: "Verified"
          },
          {
            id: "block-4",
            timestamp: new Date(Date.now() - 86400000).toISOString().replace('T', ' ').substring(0, 19),
            blockHash: "0x1029384756abcdef",
            type: "Route",
            description: "Dynamic routing updated to bypass regional congestion.",
            verifiedBy: "0x44C...11B",
            status: "Verified"
          },
          {
            id: "block-5",
            timestamp: new Date(Date.now() - 43200000).toISOString().replace('T', ' ').substring(0, 19),
            blockHash: "0xfedcba6574839201",
            type: "ColdChain",
            description: "IoT sensor logged stable ambient temp: -18.2°C.",
            verifiedBy: "0x55E...99D",
            status: "Verified"
          },
          {
            id: "block-6",
            timestamp: new Date(Date.now() - 3600000).toISOString().replace('T', ' ').substring(0, 19),
            blockHash: "0xaaaa1111bbbb2222",
            type: "Customs",
            description: "Automated customs clearance granted via smart contract.",
            verifiedBy: "0x88F...33E",
            status: "Verified"
          }
        ]
      });
    }
    
    setIsAuditing(false);
  };

  const getIconForType = (type: BlockEvent['type']) => {
    switch (type) {
      case 'Ownership': return <ShieldCheck className="w-5 h-5 text-blue-400" />;
      case 'Invoice': return <FileText className="w-5 h-5 text-emerald-400" />;
      case 'AntiCounterfeit': return <Fingerprint className="w-5 h-5 text-purple-400" />;
      case 'Route': return <Route className="w-5 h-5 text-cyan-400" />;
      case 'ColdChain': return <ThermometerSnowflake className="w-5 h-5 text-blue-300" />;
      case 'Customs': return <Stamp className="w-5 h-5 text-orange-400" />;
      default: return <Box className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[600px] pb-8">
      
      <div className="w-full xl:w-[420px] flex flex-col gap-6 shrink-0">
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500" />
          
          <div className="flex justify-between items-center mt-2 mb-4">
            <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
              <Cpu className="w-6 h-6 text-blue-500" /> Smart Contract Demo
            </h2>
            <span className="text-[9px] bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2 py-1 rounded uppercase tracking-widest font-bold animate-pulse">
              Simulation Active
            </span>
          </div>
          
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Enter any Shipment ID to generate a simulated, cryptographically secure timeline of logistics events using our AI-driven Web3 emulator.
          </p>

          <form onSubmit={runDemoAudit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Shipment ID..."
                className="w-full bg-[#111113] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
              />
            </div>
            <button 
              type="submit"
              disabled={isAuditing || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </form>
        </div>

        <AnimatePresence>
          {ledgerData && !isAuditing && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-6 flex flex-col gap-4"
            >
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-2">Contract Metadata</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Consensus</span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded">{ledgerData.networkStatus}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Total Gas</span>
                  <span className="text-[10px] font-mono text-gray-300">{ledgerData.totalGasUsed}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Contract Address</span>
                  <div className="bg-[#111113] border border-white/5 p-2 rounded-lg text-[10px] font-mono text-blue-400/80 truncate">
                    {ledgerData.contractAddress}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl p-8 relative overflow-hidden flex flex-col">
        <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2 mb-8">
          <LinkIcon className="w-5 h-5 text-blue-500" /> Immutable Block Ledger
        </h3>

        {!isAuditing && !ledgerData && !systemError && (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
            <Box className="w-16 h-16 mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white">Awaiting Genesis Block</p>
            <p className="text-[10px] mt-2 font-mono">Run a verification to build the simulated block chain.</p>
          </div>
        )}

        {isAuditing && (
          <div className="flex-1 flex flex-col items-center justify-center text-blue-400">
            <RefreshCw className="w-10 h-10 animate-spin mb-6" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-center px-6 leading-relaxed text-blue-300 animate-pulse">{loadingStep}</p>
          </div>
        )}

        {systemError && !isAuditing && (
          <div className="flex-1 flex flex-col items-center justify-center text-red-500 text-center p-6 bg-red-500/5 rounded-2xl border border-red-500/20">
            <ServerCrash className="w-12 h-12 mb-4" />
            <p className="font-black text-sm uppercase tracking-widest mb-3">RPC Connection Failed</p>
            <p className="text-[10px] leading-relaxed font-mono opacity-80">{systemError}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar relative">
          <AnimatePresence>
            {!isAuditing && ledgerData && (
              <div className="relative">
                <div className="absolute top-4 bottom-4 left-[23px] w-[2px] bg-blue-500/20 z-0" />

                <div className="space-y-6 relative z-10">
                  {ledgerData.blocks.map((block, index) => (
                    <motion.div 
                      key={block.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className="flex gap-6"
                    >
                      <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-2 bg-[#111113] border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative z-10">
                        {getIconForType(block.type)}
                      </div>

                      <div className="flex-1 bg-[#111113] border border-white/5 p-5 rounded-xl hover:border-white/10 transition-colors shadow-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                              {block.timestamp}
                            </span>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{block.type}</h4>
                          </div>
                          
                          <div className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            {block.status}
                          </div>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed mb-4">
                          {block.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
                          <div>
                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Block Hash</span>
                            <span className="text-[10px] font-mono text-cyan-400/80 truncate block">
                              {block.blockHash}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Signed By (Oracle)</span>
                            <span className="text-[10px] font-mono text-purple-400/80 truncate block">
                              {block.verifiedBy}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}