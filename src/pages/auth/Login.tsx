import { auth, googleProvider, db } from "../../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuthStore, UserRole } from "../../store/useAuthStore";
import { ShieldCheck, LogIn, Loader2 } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // New state to hold the selected role for testing/demo purposes
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin"); // Defaulted to admin to match your setup

  const handleGoogleLogin = async () => {
    try {
      setIsAuthenticating(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      // We overwrite the role with the selectedRole so you can easily switch accounts during demos
      const userProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || "Authorized Personnel",
        role: selectedRole, 
        createdAt: userDoc.exists() ? userDoc.data().createdAt : Date.now(),
      };

      // Save to Firestore and Zustand State
      await setDoc(userRef, userProfile);
      setUser(userProfile as any);

      // --- NEW ADDITION: Sync role to localStorage for synchronous UI layout checks ---
      localStorage.setItem('resilio_role', selectedRole);

      navigate("/dashboard");
    } catch (error) {
      console.error("Authentication Error:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const demoRoles: { label: string; value: UserRole }[] = [
    { label: 'Admin', value: 'admin' },
    { label: 'Supplier', value: 'supplier' },
    { label: 'Fleet', value: 'fleet_operator' },
    { label: 'Gov', value: 'government' }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-md p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl flex flex-col items-center border-t-white/20">
        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-6">
          <ShieldCheck className="w-10 h-10 text-blue-400" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight text-center">ResilioChain Access</h2>
        <p className="text-gray-400 text-sm mb-10 text-center leading-relaxed">
          Predict disruption. Re-route logistics. <br /> Authenticate to enter the Autonomous OS.
        </p>
        
        <button 
          onClick={handleGoogleLogin}
          disabled={isAuthenticating}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAuthenticating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </>
          )}
        </button>

        {/* Interactive Role Selector for the Demo */}
        <div className="mt-8 pt-8 border-t border-white/10 w-full flex flex-col items-center gap-4">
           <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Select Role for Demo Simulation</p>
           <div className="flex gap-2">
              {demoRoles.map((role) => (
                <button 
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`text-[10px] px-3 py-1.5 rounded border transition-all uppercase tracking-widest font-bold ${
                    selectedRole === role.value 
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                      : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {role.label}
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}