import { motion } from "framer-motion";
import { TrendingUp, Truck, AlertCircle, Zap } from "lucide-react";

const stats = [
  { label: "Global Health Score", value: "94%", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Active Shipments", value: "1,284", icon: Truck, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Predicted Disruptions", value: "3", icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
  { label: "Route Confidence", value: "98.2%", icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10" },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md flex items-center gap-4 group hover:border-white/20 transition-all"
        >
          <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
}