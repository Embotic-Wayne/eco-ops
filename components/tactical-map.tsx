"use client"

import { motion } from "framer-motion"
import { Crosshair, Wind, Compass, MapPin } from "lucide-react"

const heatmapBlobs = [
  { x: "25%", y: "35%", color: "rgba(255,59,59,0.15)", size: 120 },
  { x: "60%", y: "25%", color: "rgba(255,176,32,0.12)", size: 90 },
  { x: "45%", y: "60%", color: "rgba(255,59,59,0.2)", size: 140 },
  { x: "75%", y: "55%", color: "rgba(255,176,32,0.1)", size: 100 },
  { x: "35%", y: "75%", color: "rgba(43,255,136,0.08)", size: 80 },
]

const incidentMarkers = [
  { x: "44%", y: "58%", label: "WF-7721", type: "critical" },
  { x: "26%", y: "34%", label: "FLD-3302", type: "warning" },
  { x: "61%", y: "26%", label: "AQ-1190", type: "elevated" },
  { x: "73%", y: "54%", label: "DR-8854", type: "warning" },
]

function getMarkerColor(type: string) {
  switch (type) {
    case "critical": return "#ff3b3b"
    case "warning": return "#ffb020"
    case "elevated": return "#37b8ff"
    default: return "#2bff88"
  }
}

export function TacticalMap() {
  return (
    <div className="relative flex-1 bg-eco-bg overflow-hidden tactical-grid border border-eco-border rounded-sm">
      {/* Map background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-eco-blue/[0.02] via-transparent to-eco-green/[0.02]" />

      {/* Heatmap blobs */}
      {heatmapBlobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[40px]"
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            backgroundColor: blob.color,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Incident markers */}
      {incidentMarkers.map((marker, i) => (
        <motion.div
          key={i}
          className="absolute flex flex-col items-center gap-1"
          style={{ left: marker.x, top: marker.y, transform: "translate(-50%, -50%)" }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.2, duration: 0.4 }}
        >
          {/* Ping ring */}
          <motion.div
            className="absolute w-8 h-8 rounded-full border"
            style={{ borderColor: `${getMarkerColor(marker.type)}40` }}
            animate={{
              scale: [1, 2.5],
              opacity: [0.6, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
          <MapPin
            size={18}
            style={{
              color: getMarkerColor(marker.type),
              filter: `drop-shadow(0 0 6px ${getMarkerColor(marker.type)}80)`,
            }}
          />
          <span
            className="text-[8px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-eco-bg/90 border"
            style={{
              color: getMarkerColor(marker.type),
              borderColor: `${getMarkerColor(marker.type)}30`,
            }}
          >
            {marker.label}
          </span>
        </motion.div>
      ))}

      {/* Corner HUD Labels */}
      {/* Top Left */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 text-[9px] font-mono text-eco-text-dim">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm">
          <Crosshair size={10} className="text-eco-blue" />
          <span className="text-eco-blue">LAT</span>
          <span className="text-eco-text">37.7749</span>
          <span className="text-eco-text-dim mx-1">|</span>
          <span className="text-eco-blue">LNG</span>
          <span className="text-eco-text">-122.4194</span>
        </div>
      </div>

      {/* Top Right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 text-[9px] font-mono">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm">
          <Compass size={10} className="text-eco-amber" />
          <span className="text-eco-amber">ZOOM</span>
          <span className="text-eco-text">12.4x</span>
        </div>
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-3 left-3 z-10 text-[9px] font-mono">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm">
          <Wind size={10} className="text-eco-green" />
          <span className="text-eco-green">WIND</span>
          <span className="text-eco-text">NW 23 kn</span>
          <span className="text-eco-text-dim mx-1">|</span>
          <span className="text-eco-amber">GUST</span>
          <span className="text-eco-text">41 kn</span>
        </div>
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-3 right-3 z-10 text-[9px] font-mono">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm">
          <span className="text-eco-text-dim">MAPBOX</span>
          <span className="text-eco-text-dim mx-1">|</span>
          <span className="text-eco-blue">SATELLITE</span>
        </div>
      </div>

      {/* Crosshair center overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <line x1="20" y1="0" x2="20" y2="15" stroke="#37b8ff" strokeWidth="0.5" opacity="0.4" />
          <line x1="20" y1="25" x2="20" y2="40" stroke="#37b8ff" strokeWidth="0.5" opacity="0.4" />
          <line x1="0" y1="20" x2="15" y2="20" stroke="#37b8ff" strokeWidth="0.5" opacity="0.4" />
          <line x1="25" y1="20" x2="40" y2="20" stroke="#37b8ff" strokeWidth="0.5" opacity="0.4" />
          <circle cx="20" cy="20" r="3" fill="none" stroke="#37b8ff" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>
    </div>
  )
}
