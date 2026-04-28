import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ShieldAlert, Globe, Activity, ArrowRight, Globe2, 
  Zap, Leaf, Building2, Quote 
} from "lucide-react";
import GlobeMap from "../../components/visualizations/GlobeMap";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      
      {/* Background Floating Gradient Blobs (From your original code) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[150px] pointer-events-none" />

      {/* 1. TOP NAVIGATION BAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-400" />
            <span className="font-bold tracking-widest text-lg">RESILIO<span className="text-emerald-400">.OS</span></span>
          </div>
          <Link 
            to="/login" 
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all active:scale-95 text-sm"
          >
            Access Network <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* 2. HERO BANNER (Your original layout + 3D Globe!) */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex mb-8 space-x-4">
               <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <ShieldAlert className="w-8 h-8 text-emerald-400" />
               </div>
               <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <Activity className="w-8 h-8 text-blue-400" />
               </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 pb-2">
              ResilioChain AI
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-lg font-light leading-relaxed">
              Predict disruption before it happens. <br className="hidden md:block" /> Re-route before business suffers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3">
                <Activity className="w-5 h-5" /> Enter Command Center
              </Link>
              
              <Link to="/login" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all border border-white/10 flex items-center justify-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" /> Employee Login
              </Link>
            </div>
          </motion.div>

          {/* The Spinning 3D Map Component */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[400px] lg:h-[550px] w-full rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)]"
          >
            <GlobeMap />
          </motion.div>

        </div>
      </section>

      {/* 3. STATS COUNTER */}
      <section className="border-y border-white/10 bg-white/5 py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><h3 className="text-4xl font-black text-white mb-2">$4.2B+</h3><p className="text-gray-400 text-sm uppercase tracking-widest">Cargo Protected</p></div>
          <div><h3 className="text-4xl font-black text-emerald-400 mb-2">-15%</h3><p className="text-gray-400 text-sm uppercase tracking-widest">CO2 Emissions</p></div>
          <div><h3 className="text-4xl font-black text-blue-400 mb-2">4,200</h3><p className="text-gray-400 text-sm uppercase tracking-widest">Simulations/Sec</p></div>
          <div><h3 className="text-4xl font-black text-white mb-2">99.9%</h3><p className="text-gray-400 text-sm uppercase tracking-widest">Uptime</p></div>
        </div>
      </section>

      {/* 4. FEATURE HIGHLIGHTS */}
      <section className="py-32 max-w-7xl mx-auto px-6 relative z-20">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black mb-4">The Autonomous OS Architecture</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">We don't just show you data. We simulate the future and execute self-healing protocols.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: ShieldAlert, title: "Disruption Radar", desc: "Real-time ingestion of global weather, port telemetry, and geopolitical feeds to flag risks before they hit the news." },
            { icon: Globe2, title: "Digital Twin Sandbox", desc: "Stress-test your network. Inject ransomware or typhoon variables to see exactly how your supply chain will break." },
            { icon: Zap, title: "Gemini Copilot", desc: "Automated self-healing. AI analyzes 4,000+ historical vectors to recommend and execute real-time cargo rerouting." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <feature.icon className="w-12 h-12 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SDG IMPACT SECTION */}
      <section className="py-32 bg-[#111113] border-y border-white/10 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black mb-12 text-center">Aligned with UN Sustainable Development Goals</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
              <Building2 className="w-10 h-10 text-orange-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2">SDG 9: Industry & Infrastructure</h3>
              <p className="text-gray-400 leading-relaxed">By dynamically rerouting around bottlenecks, Resilio.OS creates resilient infrastructure and prevents catastrophic industrial downtime during global crises.</p>
            </div>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
              <Leaf className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2">SDG 13: Climate Action</h3>
              <p className="text-gray-400 leading-relaxed">Our routing algorithm penalizes high-emission routes, actively reducing the carbon footprint of global logistics fleets by up to 15% annually.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-32 max-w-7xl mx-auto px-6 relative z-20">
        <h2 className="text-3xl font-black mb-16 text-center">Network Feedback</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
            <Quote className="w-8 h-8 text-blue-400 mb-4 opacity-50" />
            <p className="text-lg text-gray-300 mb-6 italic">"When the Shanghai port strike hit, the Digital Twin predicted our exact delays 48 hours before our competitors even knew. It saved us $2.1M in spoilage."</p>
            <div className="font-bold text-white">Director of Logistics</div>
            <div className="text-sm text-gray-500">Global Pharma Corp</div>
          </div>
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
            <Quote className="w-8 h-8 text-emerald-400 mb-4 opacity-50" />
            <p className="text-lg text-gray-300 mb-6 italic">"The integration of Gemini AI to automatically suggest lower-carbon alternate routes helped us hit our sustainability targets three quarters early."</p>
            <div className="font-bold text-white">VP of Supply Chain</div>
            <div className="text-sm text-gray-500">Consumer Electronics Co.</div>
          </div>
        </div>
      </section>

      {/* 7. CTA & FOOTER */}
      <section className="py-32 relative overflow-hidden text-center z-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <h2 className="text-5xl font-black mb-6 relative z-10">Ready to secure your network?</h2>
        <p className="text-xl text-gray-400 mb-10 relative z-10">Deploy the Resilio.OS sandbox and run your first simulation today.</p>
        <Link to="/login" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 relative z-10 shadow-2xl">
          Enter Command Center <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <footer className="border-t border-white/10 bg-[#050505] py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Activity className="w-5 h-5" />
            <span className="font-bold tracking-widest text-sm">RESILIO<span className="text-emerald-400">.OS</span></span>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            © 2026 ResilioChain AI. Built for the Google Solution Challenge.
          </div>
          <div className="flex items-center gap-6 text-gray-400">
            <a href="https://github.com/yourusername/resilio-os" target="_blank" className="text-sm font-bold hover:text-white transition-colors">GitHub Repo</a><a href="https://github.com/shibashisdas76/resilio-os" target="_blank" className="text-sm font-bold hover:text-white transition-colors">GitHub Repo</a>
            <span className="text-sm hover:text-white cursor-pointer transition-colors">Documentation</span>
            <span className="text-sm hover:text-white cursor-pointer transition-colors">Privacy</span>
          </div>
        </div>
      </footer>

    </div>
  );
}