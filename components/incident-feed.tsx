"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Flame, Droplets, CloudRain, ThermometerSun } from "lucide-react"

interface Incident {
  id: string
  time: string
  severity: "critical" | "high" | "elevated" | "low"
  message: string
  icon: "fire" | "flood" | "air" | "storm" | "heat"
}

const incidents: Incident[] = [
  { id: "WF-7721", time: "14:32:07", severity: "critical", message: "Wildfire spread rate accelerating — Zone 7 perimeter breached", icon: "fire" },
  { id: "AQ-1190", time: "14:28:45", severity: "elevated", message: "PM2.5 readings 3x threshold in downtown corridor", icon: "air" },
  { id: "FLD-3302", time: "14:25:12", severity: "high", message: "River gauge Station Delta exceeding flood stage +2.1m", icon: "flood" },
  { id: "ST-4410", time: "14:21:33", severity: "elevated", message: "Severe thunderstorm warning — rotating supercell detected", icon: "storm" },
  { id: "HT-5501", time: "14:18:09", severity: "low", message: "Urban heat island effect nominal — monitoring stations green", icon: "heat" },
  { id: "WF-7722", time: "14:14:55", severity: "critical", message: "Evacuation recommended — fire line approaching settlement Alpha", icon: "fire" },
  { id: "FLD-3303", time: "14:10:41", severity: "high", message: "Levee integrity compromised — Sector 12 at risk", icon: "flood" },
  { id: "AQ-1191", time: "14:07:22", severity: "elevated", message: "Smoke plume drift modeling indicates southern migration", icon: "air" },
]

function getSeverityStyles(severity: string) {
  switch (severity) {
    case "critical":
      return { bg: "bg-eco-red/15", text: "text-[#ff3b3b]", border: "border-[#ff3b3b]/30", dot: "#ff3b3b" }
    case "high":
      return { bg: "bg-eco-amber/15", text: "text-[#ffb020]", border: "border-[#ffb020]/30", dot: "#ffb020" }
    case "elevated":
      return { bg: "bg-eco-blue/15", text: "text-[#37b8ff]", border: "border-[#37b8ff]/30", dot: "#37b8ff" }
    default:
      return { bg: "bg-eco-green/15", text: "text-[#2bff88]", border: "border-[#2bff88]/30", dot: "#2bff88" }
  }
}

function getIcon(icon: string) {
  switch (icon) {
    case "fire": return <Flame size={12} />
    case "flood": return <Droplets size={12} />
    case "storm": return <CloudRain size={12} />
    case "heat": return <ThermometerSun size={12} />
    default: return <AlertTriangle size={12} />
  }
}

export function IncidentFeed() {
  return (
    <div className="flex flex-col w-72 border-l border-eco-border bg-eco-surface">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-eco-border bg-eco-surface-2">
        <AlertTriangle size={14} className="text-eco-amber" />
        <span className="text-xs font-sans font-bold tracking-wider text-eco-amber uppercase">
          Global Incident Feed
        </span>
        <motion.div
          className="ml-auto w-1.5 h-1.5 rounded-full bg-eco-red"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1.5">
        {incidents.map((incident, i) => {
          const styles = getSeverityStyles(incident.severity)
          return (
            <motion.div
              key={incident.id}
              className={`p-2.5 rounded-sm border ${styles.border} ${styles.bg} transition-colors`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={styles.text}>{getIcon(incident.icon)}</span>
                <span className={`text-[9px] font-mono font-bold tracking-wider ${styles.text}`}>
                  {incident.id}
                </span>
                <span className="ml-auto text-[8px] font-mono text-eco-text-dim">
                  {incident.time}
                </span>
              </div>
              <p className="text-[10px] font-mono leading-relaxed text-eco-text/80">
                {incident.message}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: styles.dot }} />
                <span className={`text-[8px] font-mono font-bold tracking-widest uppercase ${styles.text}`}>
                  {incident.severity}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
