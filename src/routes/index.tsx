import { createBrowserRouter } from "react-router-dom";
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
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />, 
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
        element: <LiveMap /> // <-- This connects the URL to your new component!
      },
      {
        path: "radar", 
        element: <RadarPage />, 
      },
      {
        path: "routing",
        element: <SelfHealingRouting />
      },
      {
        path: "routing",
        element: <SelfHealingRouting />
      },
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
        path: "settings", // This MUST match the Sidebar path
        element: <SettingsPortal />
      },
    ]
  }
  // Make absolutely sure there is NOTHING else down here!
]);