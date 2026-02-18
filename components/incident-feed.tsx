"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Flame, Droplets, CloudRain, ThermometerSun, CheckCircle2 } from "lucide-react"

export interface Incident {
  id: string
  time: string
  severity: "critical" | "high" | "elevated" | "low"
  message: string
  icon: "fire" | "flood" | "air" | "storm" | "heat"
  dispatched?: boolean
  latitude?: number
  longitude?: number
}

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

function severityFromLevel(level: number): "critical" | "high" | "elevated" | "low" {
  if (level <= 3) return "low"
  if (level <= 6) return "elevated"
  if (level <= 8) return "high"
  return "critical"
}

function iconFromHazardType(type: string): "fire" | "flood" | "air" | "storm" | "heat" {
  const t = type?.toLowerCase() ?? ""
  if (t.includes("fire") || t.includes("wildfire")) return "fire"
  if (t.includes("flood") || t.includes("water") || t.includes("river") || t.includes("leak")) return "flood"
  if (t.includes("air") || t.includes("quality") || t.includes("chemical")) return "air"
  if (t.includes("storm") || t.includes("weather")) return "storm"
  if (t.includes("heat")) return "heat"
  return "fire"
}

interface IncidentFeedProps {
  incidents?: Incident[]
}

export function IncidentFeed({ incidents = [] }: IncidentFeedProps) {
  return (
    <div className="flex flex-col flex-1 min-w-0 border-l border-eco-border bg-eco-surface">
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
        {incidents.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-xs font-mono text-eco-text-dim text-center px-4">
              Reported incidents will appear here.
            </p>
          </div>
        ) : (
          incidents.map((incident, i) => {
            const styles = getSeverityStyles(incident.severity)
            return (
              <motion.div
                key={incident.id}
                className={`p-2.5 rounded-sm border ${styles.border} ${styles.bg} transition-colors`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
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
                <div className="mt-1.5 flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: styles.dot }} />
                    <span className={`text-[8px] font-mono font-bold tracking-widest uppercase ${styles.text}`}>
                      {incident.severity}
                    </span>
                  </div>
                  {incident.dispatched && (
                    <span className="flex items-center gap-1 text-[8px] font-mono font-bold tracking-widest text-eco-green">
                      <CheckCircle2 size={10} />
                      DISPATCHED
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

export { severityFromLevel, iconFromHazardType }
