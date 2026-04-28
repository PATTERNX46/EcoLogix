import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Building2, Palette, Link as LinkIcon, 
  Bell, Key, CreditCard, Save, CheckCircle2, 
  UserPlus, Globe, Moon, Sun, ShieldCheck, Mail,
  RefreshCw // <-- THIS WAS LIKELY MISSING
} from 'lucide-react';
import { useAuthStore } from "../../store/useAuthStore";

type SettingsTab = 'profile' | 'organization' | 'theme' | 'integrations' | 'notifications' | 'api' | 'billing';

export default function SettingsPortal() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dummy state for theme toggle demo
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 1200);
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'theme', label: 'Theme & UX', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[750px] pb-8">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-64 shrink-0 bg-[#0a0a0c] border border-white/5 rounded-2xl p-4 h-fit">
        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 px-3">System Settings</h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as SettingsTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* CONTENT AREA */}
      <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="space-y-8"
              >
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center border-4 border-white/5 shadow-2xl">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{user?.displayName || "Authorized Operator"}</h3>
                    <p className="text-xs text-gray-500 font-mono tracking-widest">{user?.email || "internal@resilio.os"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Display Name</label>
                    <input type="text" defaultValue={user?.displayName || ""} className="w-full bg-[#050507] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Operator Role</label>
                    <div className="w-full bg-[#050507] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-400 capitalize">
                      {user?.role?.replace('_', ' ') || 'Analyst'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'organization' && (
              <motion.div key="org" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Building2 className="w-8 h-8 text-blue-400" />
                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">Enterprise Workspace</h4>
                      <p className="text-xs text-gray-500">Managing global logistics nodes</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/10 transition-all">
                    <UserPlus className="w-3.5 h-3.5" /> Add Team Member
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'api' && (
              <motion.div key="api" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Production API Keys</h3>
                   <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all">Generate New</button>
                </div>
                <div className="bg-[#050507] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Key className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs font-mono text-gray-300">res_live_x89a9f...b4c7dE</p>
                      <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">Status: Active</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-[#050507] border border-white/10 rounded-3xl">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Current Subscription</h4>
                    <p className="text-2xl font-black text-white mb-2 uppercase">RESILIO ELITE</p>
                    <p className="text-xs text-gray-400 mb-6 font-mono">Usage-based billing enabled</p>
                    <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">View Invoices</button>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-blue-500/30 rounded-3xl">
                       <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Security Tier</h4>
                       <p className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                         <ShieldCheck className="w-4 h-4 text-emerald-400" /> SOC2 Compliance Active
                       </p>
                       <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">Enterprise SLA: 99.9%</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Catch-all for non-implemented tabs */}
            {(activeTab === 'theme' || activeTab === 'notifications' || activeTab === 'integrations') && (
              <motion.div key="sub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 opacity-30">
                <ShieldCheck className="w-12 h-12 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">
                   Interface locked during active <br/> synchronization
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="mt-auto pt-8 border-t border-white/5 flex justify-end gap-4 shrink-0">
           <button onClick={() => setSaveSuccess(false)} className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Discard</button>
           <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 min-w-[180px] justify-center"
           >
             {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
             {isSaving ? 'Updating...' : saveSuccess ? 'Config Saved' : 'Save Changes'}
           </button>
        </div>
      </div>
    </div>
  );
}