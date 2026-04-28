import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Globe2, Activity, AlertTriangle, 
  Settings, Search, Menu, X, Bell, User, LogOut, Shield, Route, ScatterChart, LinkIcon, ShieldAlert, Wrench, Siren, Landmark, Code2,ThermometerSnowflake,Leaf,AlertOctagon,Cpu
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { Building2 } from "lucide-react";
import GeminiCopilot from '../copilot/GeminiCopilot';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const profileRef = useRef<HTMLDivElement>(null); 

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('resilio_role'); // Clear role on logout
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: "Command Center", path: "/dashboard" },
    { icon: Globe2, label: "Live Map", path: "/dashboard/map" },
    { icon: AlertTriangle, label: "Disruption Radar", path: "/dashboard/radar" },
    { icon: Activity, label: "Digital Twin", path: "/dashboard/twin" },
    { icon: Route, label: "Self-Healing Routing", path: "/dashboard/routing" },
    { icon: ScatterChart, label: "AI Optimizer", path: "/dashboard/optimization" },
    { icon: Building2, label: "Supplier Intel", path: "/dashboard/suppliers" },
    { icon: LinkIcon, label: "Trust Ledger", path: "/dashboard/ledger" }, 
    { icon: Bell, label: "Alerting Center", path: "/dashboard/alerts" },
    { icon: ShieldAlert, label: "Fraud Center", path: "/dashboard/fraud" },
    { icon: Wrench, label: "Fleet Maintenance", path: "/dashboard/fleet" },
    { icon: Siren, label: "Disaster Response", path: "/dashboard/disaster-response" },
    { icon: ThermometerSnowflake, label: "Cold Chain", path: "/dashboard/cold-chain" },
    { icon: Leaf, label: "Carbon Intel", path: "/dashboard/carbon" },
    { icon: AlertOctagon, label: "Global Heatmap", path: "/dashboard/heatmap" },
    { icon: Landmark, label: "Gov Command", path: "/dashboard/government" },
    { icon: Code2, label: "API Portal", path: "/dashboard/api" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
    { icon: Cpu, label: "AI Neural Grid", path: "/dashboard/ai-registry" },
    

  ];

  // --- NEW ROLE-BASED FILTERING LOGIC ---
  const userRole = localStorage.getItem('resilio_role') || 'admin';

  const filteredNavItems = navItems.filter(item => {
    if (item.path === '/dashboard/government' && userRole !== 'government') {
      return false; // Hide from normal admins
    }
    return true; // Show everything else
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex overflow-hidden font-sans selection:bg-emerald-500/30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.aside 
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="relative z-20 h-screen border-r border-white/10 bg-[#09090b]/80 backdrop-blur-xl flex flex-col shrink-0"
      >
        <div className="h-20 flex items-center px-6 border-b border-white/10 overflow-hidden shrink-0">
          <Activity className="w-8 h-8 text-emerald-400 shrink-0" />
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="ml-3 font-bold tracking-widest whitespace-nowrap"
              >
                RESILIO<span className="text-emerald-400">.OS</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* --- FIX: Added overflow-y-auto and custom-scrollbar to make it scrollable --- */}
        <nav className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {/* Map over the FILTERED items instead of all items */}
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/dashboard/");
            return (
              <Link 
                key={item.path} 
                to={item.path}
                // Added shrink-0 so links don't compress when scrolling
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all shrink-0 ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
             <LogOut className="w-5 h-5 shrink-0" />
             <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Log Out
                  </motion.span>
                )}
             </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        <header className="relative z-50 h-20 border-b border-white/10 bg-[#09090b]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setIsCommandOpen(true)}
              className="hidden md:flex items-center gap-24 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="text-sm">Search network...</span>
              </div>
              <kbd className="hidden sm:inline-flex px-2 py-0.5 text-xs font-mono bg-white/10 rounded border border-white/10 text-gray-400">Ctrl K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-4 relative z-50" ref={profileRef}>
            <button className="p-2 text-gray-400 hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
            </button>
            
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center border border-white/20 shadow-lg shadow-emerald-500/20 cursor-pointer hover:scale-105 transition-transform"
            >
              <User className="w-5 h-5 text-white" />
            </div>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-14 right-0 w-64 bg-[#18181b] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-[100]"
                >
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <p className="text-sm font-bold text-white truncate">{user?.displayName || "Authorized User"}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email || "No email provided"}</p>
                    <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-md w-fit">
                      <Shield className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                        {user?.role?.replace('_', ' ') || userRole || "Analyst"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" /> Account Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Terminate Session
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* This Outlet is what draws the pages inside the layout! */}
        <div className="flex-1 overflow-auto p-6 scrollbar-hide relative z-10">
          <Outlet />
        </div>
      </main>

      <AnimatePresence>
        {isCommandOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsCommandOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-[#111113] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <Search className="w-5 h-5 text-blue-400" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Type a command or search..." 
                  className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg"
                />
                <button onClick={() => setIsCommandOpen(false)}><X className="w-5 h-5 text-gray-500 hover:text-white" /></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <GeminiCopilot />
    </div>
  );
}