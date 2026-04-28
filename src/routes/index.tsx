import { createBrowserRouter, useRouteError } from "react-router-dom";
import Landing from "../pages/landing/Landing";
import Login from "../pages/auth/Login";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import DigitalTwin from "../pages/dashboard/DigitalTwin";
import RadarPage from "../pages/dashboard/RadarPage"; 
import SelfHealingRouting from "../components/visualizations/SelfHealingRouting";
import { ProtectedRoute } from "./ProtectedRoute";
import OptimizationEngine from "../components/visualizations/OptimizationEngine";
import SupplierIntelligence from "../components/visualizations/SupplierIntelligence";
import LiveMap from "../components/visualizations/LiveMap";
import BlockchainLedger from "../components/visualizations/BlockchainLedger";
import AlertingCenter from "@/components/visualizations/AlertingCenter";
import FraudDetectionCenter from "../components/visualizations/FraudDetectionCenter";
import FleetMaintenance from "../components/visualizations/FleetMaintenance";
import DisasterResponse from "../components/visualizations/DisasterResponse";
import GovernmentDashboard from "../components/visualizations/GovernmentDashboard";
import ApiPortal from "../components/visualizations/ApiPortal";
import ColdChainGuardian from "../components/visualizations/ColdChainGuardian";
import CarbonIntelligence from "../components/visualizations/CarbonIntelligence";
import RiskHeatmap from "../components/visualizations/RiskHeatmap";
import SettingsPortal from "../components/visualizations/SettingsPortal";
import AIRegistryHealth from "../pages/admin/AIRegistryHealth";

// A sleek fallback component in case of crashes
const GlobalError = () => {
  const error: any = useRouteError();
  return (
    <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 mb-6 rounded-full border-2 border-red-500/50 flex items-center justify-center bg-red-500/10">
        <span className="text-red-500 text-4xl font-black">!</span>
      </div>
      <h1 className="text-2xl font-black text-white tracking-widest uppercase mb-4">Connection Lost</h1>
      <p className="text-gray-400 font-mono text-sm max-w-md">
        Resilio.OS has encountered an unexpected routing error. 
        <br/><br/>
        <span className="text-red-400">{error?.statusText || error?.message || "404 - Sector Not Found"}</span>
      </p>
      <a href="/dashboard" className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 transition-colors">
        Reboot Dashboard
      </a>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />, 
    errorElement: <GlobalError />
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <GlobalError />, // Catches errors inside the dashboard
    children: [
      {
        index: true, 
        element: <Dashboard />,
      },
      {
        path: "twin", 
        element: <DigitalTwin />,
      },
      {
        path: "map",
        element: <LiveMap />
      },
      {
        path: "radar", 
        element: <RadarPage />, 
      },
      {
        path: "routing",
        element: <SelfHealingRouting />
      },
      // Removed the duplicate "routing" block here!
      {
        path: "optimization",
        element: <OptimizationEngine />
      },
      {
        path: "suppliers",
        element: <SupplierIntelligence />
      },
      {
        path: "ledger",
        element: <BlockchainLedger />
      },
      {
        path: "alerts",
        element: <AlertingCenter />
      },
      {
        path: "fraud",
        element: <FraudDetectionCenter />
      },
      {
        path: "fleet",
        element: <FleetMaintenance />
      },
      {
        path: "disaster-response",
        element: <DisasterResponse />
      },
      {
        path: "cold-chain",
        element: <ColdChainGuardian />
      },
      {
        path: "government",
        element: <GovernmentDashboard />
      },
      {
        path: "api",
        element: <ApiPortal />
      },
      {
        path: "carbon",
        element: <CarbonIntelligence />
      },
      {
        path: "heatmap",
        element: <RiskHeatmap />
      },
      {
        path: "settings", 
        element: <SettingsPortal />
      },
      {
        path: "ai-registry",
        element: <AIRegistryHealth />
      },
    ]
  }
]);