"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, ChevronDown, Shield, Clock, MapPin, Users, AlertTriangle } from "lucide-react"

interface Briefing {
  id: string
  classification: "top-secret" | "secret" | "confidential" | "unclassified"
  title: string
  operationName: string
  zone: string
  team: string
  time: string
  status: "active" | "standby" | "complete" | "aborted"
  summary: string
  objectives: string[]
}

const briefings: Briefing[] = [
  {
    id: "BR-001",
    classification: "top-secret",
    title: "Wildfire Containment - Zone 7",
    operationName: "FIREWALL DELTA",
    zone: "Sierra Nevada Sector 7-Alpha",
    team: "Strike Team Ember",
    time: "14:00 UTC",
    status: "active",
    summary: "Fire front advancing toward Settlement Alpha at 2.3 km/h. Wind shear NW 41kn gusts creating unpredictable spread patterns. Satellite thermal imaging confirms accelerating rate.",
    objectives: [
      "Establish secondary firebreak along Route 12 corridor",
      "Deploy aerial tanker support on southern flank",
      "Evacuate Settlement Alpha civilians within 90-min window",
      "Coordinate with Station Delta for water resource allocation",
    ],
  },
  {
    id: "BR-002",
    classification: "secret",
    title: "Flood Mitigation - Sector 12",
    operationName: "LEVEE SENTINEL",
    zone: "Mississippi Delta Sector 12",
    team: "Hydro Response Unit",
    time: "13:45 UTC",
    status: "active",
    summary: "River gauge Station Delta exceeding flood stage by +2.1m. Levee integrity compromised at three structural weak points. Overflow projected within 4 hours.",
    objectives: [
      "Deploy emergency sandbag reinforcement at breach points",
      "Activate backup pump stations along eastern perimeter",
      "Reroute downstream traffic via alternate channels",
    ],
  },
  {
    id: "BR-003",
    classification: "confidential",
    title: "Air Quality Crisis - Downtown",
    operationName: "CLEAR SKY",
    zone: "Metro Core District",
    team: "Environmental Monitoring Cell",
    time: "13:20 UTC",
    status: "standby",
    summary: "PM2.5 readings 3x threshold in downtown corridor from wildfire smoke drift. Plume modeling indicates southern migration pattern. Public health advisory issued.",
    objectives: [
      "Activate air filtration systems in public shelters",
      "Issue N95 mask distribution to vulnerable populations",
      "Monitor real-time AQI at 15-minute intervals",
    ],
  },
  {
    id: "BR-004",
    classification: "unclassified",
    title: "Severe Weather Tracking",
    operationName: "STORM WATCH",
    zone: "Central Plains Region",
    team: "Meteorological Analysis",
    time: "12:50 UTC",
    status: "standby",
    summary: "Rotating supercell detected with potential tornado formation. Tracking northeast at 35 mph. Estimated impact zone includes rural communities.",
    objectives: [
      "Maintain continuous Doppler radar surveillance",
      "Pre-position emergency response assets along projected path",
    ],
  },
]

function getClassificationStyles(classification: string) {
  switch (classification) {
    case "top-secret":
      return { bg: "bg-[#ff3b3b]/10", text: "text-[#ff3b3b]", border: "border-[#ff3b3b]/30", label: "TOP SECRET" }
    case "secret":
      return { bg: "bg-[#ffb020]/10", text: "text-[#ffb020]", border: "border-[#ffb020]/30", label: "SECRET" }
    case "confidential":
      return { bg: "bg-[#37b8ff]/10", text: "text-[#37b8ff]", border: "border-[#37b8ff]/30", label: "CONFIDENTIAL" }
    default:
      return { bg: "bg-[#2bff88]/10", text: "text-[#2bff88]", border: "border-[#2bff88]/30", label: "UNCLASSIFIED" }
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "active":
      return { text: "text-[#2bff88]", dot: "#2bff88", label: "ACTIVE" }
    case "standby":
      return { text: "text-[#ffb020]", dot: "#ffb020", label: "STANDBY" }
    case "complete":
      return { text: "text-[#37b8ff]", dot: "#37b8ff", label: "COMPLETE" }
    case "aborted":
      return { text: "text-[#ff3b3b]", dot: "#ff3b3b", label: "ABORTED" }
    default:
      return { text: "text-eco-text-dim", dot: "#6a6a7a", label: "UNKNOWN" }
  }
}

function BriefingCard({ briefing, index }: { briefing: Briefing; index: number }) {
  const [expanded, setExpanded] = useState(index === 0)
  const classStyles = getClassificationStyles(briefing.classification)
  const statusStyles = getStatusStyles(briefing.status)

  return (
    <motion.div
      className={`border rounded-sm overflow-hidden ${classStyles.border} ${classStyles.bg}`}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12, duration: 0.3 }}
    >
      {/* Card Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
      >
        <AlertTriangle size={11} className={classStyles.text} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded-sm border ${classStyles.text} ${classStyles.border} ${classStyles.bg}`}>
              {classStyles.label}
            </span>
            <span className="text-[9px] font-mono text-eco-text-dim">{briefing.id}</span>
            <div className="flex items-center gap-1 ml-auto">
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusStyles.dot }}
                animate={briefing.status === "active" ? { opacity: [1, 0.3, 1] } : {}}
                transition={briefing.status === "active" ? { duration: 1.5, repeat: Infinity } : undefined}
              />
              <span className={`text-[8px] font-mono font-bold tracking-widest ${statusStyles.text}`}>
                {statusStyles.label}
              </span>
            </div>
          </div>
          <p className="text-[10px] font-mono text-eco-text mt-1 truncate">{briefing.title}</p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} className="text-eco-text-dim" />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 flex flex-col gap-2 border-t border-white/[0.04] pt-2">
              {/* Meta info */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-eco-text-dim">
                  <Shield size={9} className={classStyles.text} />
                  <span className={classStyles.text}>OP:</span>
                  <span className="text-eco-text">{briefing.operationName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-eco-text-dim">
                  <MapPin size={9} className="text-eco-amber" />
                  <span className="text-eco-text">{briefing.zone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-eco-text-dim">
                  <Users size={9} className="text-eco-blue" />
                  <span className="text-eco-text">{briefing.team}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-eco-text-dim">
                  <Clock size={9} className="text-eco-text-dim" />
                  <span className="text-eco-text">{briefing.time}</span>
                </div>
              </div>

              {/* Summary */}
              <p className="text-[10px] font-mono leading-relaxed text-eco-text/70">{briefing.summary}</p>

              {/* Objectives */}
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-mono font-bold tracking-widest text-eco-text-dim uppercase">
                  Objectives
                </span>
                {briefing.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[9px] font-mono text-eco-text/70">
                    <span className={`mt-0.5 ${classStyles.text}`}>{">"}</span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function AgentBriefings() {
  return (
    <div className="flex flex-col h-full bg-eco-surface terminal-noise">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-eco-border bg-eco-surface-2">
        <FileText size={14} className="text-eco-amber" />
        <span className="text-xs font-sans font-bold tracking-wider text-eco-amber uppercase">
          Agent Briefings
        </span>
        <span className="ml-auto text-[8px] font-mono tracking-widest text-eco-text-dim">
          {briefings.length} ACTIVE
        </span>
      </div>

      {/* Briefing list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1.5">
        {briefings.map((briefing, i) => (
          <BriefingCard key={briefing.id} briefing={briefing} index={i} />
        ))}
      </div>
    </div>
  )
}
