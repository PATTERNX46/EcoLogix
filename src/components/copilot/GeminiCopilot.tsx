import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Mic, Volume2, VolumeX, 
  Sparkles, Loader2, Globe, AlertTriangle, Route, FileText
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "PASTE_YOUR_API_KEY_HERE";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const QUICK_PROMPTS = [
  { icon: AlertTriangle, text: "Which shipment is most at risk?" },
  { icon: Clock, text: "Why is there a delay?" },
  { icon: Route, text: "Calculate the best reroute." },
  { icon: FileText, text: "Generate executive report." }
];

const LANGUAGES = [
  { code: 'en-US', name: 'English', promptExt: 'Respond in English.' },
  { code: 'hi-IN', name: 'Hindi', promptExt: 'Respond in Hindi (Devanagari script).' },
  { code: 'bn-IN', name: 'Bengali', promptExt: 'Respond in Bengali script.' },
  { code: 'es-ES', name: 'Spanish', promptExt: 'Respond in Spanish.' }
];

export default function GeminiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: "Resilio.OS Copilot initialized. How can I optimize your network today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Voice & Audio State
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Speech to Text (STT)
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    // @ts-ignore - webkitSpeechRecognition is not standard TS yet
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language.code;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Text to Speech (TTS)
  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel(); // Stop current speaking
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language.code;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Build conversational history for Gemini
      const contents = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      // Append the new message with context and language instructions
      contents.push({
        role: 'user',
        parts: [{ 
          text: `Context: You are the Resilio.OS Supply Chain Copilot. Be concise, professional, and highly technical. ${language.promptExt}\n\nUser Query: ${text}` 
        }]
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) throw new Error("API Connection Failed");

      const data = await response.json();
      const replyText = data.candidates[0].content.parts[0].text;

      const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: replyText };
      setMessages(prev => [...prev, modelMsg]);
      speakText(replyText);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = { id: Date.now().toString(), role: 'model', text: "Network interference detected. API rate limit may be active. Please try again." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.3)] z-50 flex items-center justify-center transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-blue-600 hover:bg-blue-500'}`}
      >
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>

      {/* CHAT PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-full max-w-[400px] h-[600px] max-h-[80vh] bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* HEADER */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-transparent flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-widest uppercase">Gemini Copilot</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Neural Link Active</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="p-2 text-gray-400 hover:text-white transition-colors">
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-lg shadow-blue-900/20' 
                      : 'bg-[#111113] text-gray-200 border border-white/10 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1 px-1">
                    {msg.role === 'user' ? 'Operator' : 'Gemini 2.5'}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start">
                  <div className="bg-[#111113] border border-white/10 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* QUICK PROMPTS */}
            {messages.length < 3 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(prompt.text)}
                    className="shrink-0 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <prompt.icon className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">{prompt.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* INPUT AREA */}
            <div className="p-4 bg-[#0a0a0c] border-t border-white/10 shrink-0">
              
              {/* Language Selector */}
              <div className="flex justify-between items-center mb-3 px-1">
                <div className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer group relative">
                  <Globe className="w-3 h-3" />
                  <select 
                    value={language.code}
                    onChange={(e) => setLanguage(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
                    className="text-[9px] font-bold uppercase tracking-widest bg-transparent appearance-none outline-none cursor-pointer"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code} className="bg-[#111113]">{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-end gap-2 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(input);
                    }
                  }}
                  placeholder="Ask Gemini to analyze network..."
                  className="flex-1 bg-[#111113] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none max-h-32 custom-scrollbar"
                  rows={1}
                  style={{ minHeight: '44px' }}
                />
                
                <button 
                  onClick={toggleListening}
                  className={`absolute right-12 bottom-1.5 p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-white/5 disabled:text-gray-500 text-white rounded-xl transition-colors shrink-0"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Temporary Icon definitions for the quick prompts to avoid massive imports
function Clock(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}