"use client"

import { motion } from "framer-motion"
import { Crosshair, Wind, Compass, MapPin, Flame, CloudAlert, CircleAlert, Map } from "lucide-react"

interface MapMarker {
  x: string
  y: string
  label: string
  type: "fire" | "pothole" | "air-quality"
  detail: string
}

const markers: MapMarker[] = [
  { x: "22%", y: "30%", label: "WF-7721", type: "fire", detail: "Active wildfire - 2.3 km/h NE" },
  { x: "44%", y: "55%", label: "WF-7722", type: "fire", detail: "Brush fire - 80% contained" },
  { x: "68%", y: "25%", label: "WF-7730", type: "fire", detail: "Hotspot detected - monitoring" },
  { x: "15%", y: "65%", label: "PH-4401", type: "pothole", detail: "Severe road damage - Rt. 12" },
  { x: "55%", y: "72%", label: "PH-4402", type: "pothole", detail: "Sinkhole risk - Main St." },
  { x: "82%", y: "58%", label: "PH-4403", type: "pothole", detail: "Infrastructure collapse zone" },
  { x: "35%", y: "42%", label: "AQ-1190", type: "air-quality", detail: "PM2.5 3x threshold" },
  { x: "72%", y: "42%", label: "AQ-1191", type: "air-quality", detail: "Smoke plume - southern drift" },
  { x: "50%", y: "22%", label: "AQ-1192", type: "air-quality", detail: "Ozone alert - urban core" },
  { x: "30%", y: "80%", label: "AQ-1193", type: "air-quality", detail: "Particulate elevation - moderate" },
]

const heatmapBlobs = [
  { x: "22%", y: "30%", color: "rgba(255,59,59,0.18)", size: 160 },
  { x: "44%", y: "55%", color: "rgba(255,59,59,0.12)", size: 110 },
  { x: "68%", y: "25%", color: "rgba(255,59,59,0.1)", size: 90 },
  { x: "35%", y: "42%", color: "rgba(255,176,32,0.12)", size: 130 },
  { x: "72%", y: "42%", color: "rgba(255,176,32,0.1)", size: 100 },
  { x: "15%", y: "65%", color: "rgba(55,184,255,0.08)", size: 70 },
  { x: "55%", y: "72%", color: "rgba(55,184,255,0.08)", size: 70 },
]

/* Simulated map "terrain" lines */
const terrainPaths = [
  "M0,200 Q150,180 300,220 T600,190 T900,210 T1200,195",
  "M0,350 Q200,330 400,360 T800,340 T1100,355",
  "M0,500 Q100,490 250,510 T550,495 T850,515 T1150,500",
  "M50,100 Q200,80 350,130 T700,90 T1000,120",
]

function getMarkerStyles(type: MapMarker["type"]) {
  switch (type) {
    case "fire":
      return { color: "#ff3b3b", bg: "rgba(255,59,59,0.15)", icon: <Flame size={16} /> }
    case "pothole":
      return { color: "#37b8ff", bg: "rgba(55,184,255,0.15)", icon: <CircleAlert size={16} /> }
    case "air-quality":
      return { color: "#ffb020", bg: "rgba(255,176,32,0.15)", icon: <CloudAlert size={16} /> }
  }
}

export function TacticalMap() {
  return (
    <div className="relative w-full h-full bg-eco-bg overflow-hidden tactical-grid">
      {/* Section header bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-6 py-3 bg-eco-surface/90 border-b border-eco-border backdrop-blur-sm">
        <Map size={14} className="text-eco-green" />
        <span className="text-xs font-sans font-bold tracking-wider text-eco-green uppercase">
          Tactical Situation Map
        </span>
        <span className="text-[9px] font-mono tracking-widest text-eco-text-dim ml-2">
          LIVE FEED
        </span>
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-eco-red ml-1"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Legend */}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Flame size={10} className="text-[#ff3b3b]" />
            <span className="text-[9px] font-mono text-[#ff3b3b]">FIRE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CircleAlert size={10} className="text-[#37b8ff]" />
            <span className="text-[9px] font-mono text-[#37b8ff]">POTHOLE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CloudAlert size={10} className="text-[#ffb020]" />
            <span className="text-[9px] font-mono text-[#ffb020]">AIR QUALITY</span>
          </div>
        </div>
      </div>

      {/* Map background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-eco-blue/[0.02] via-transparent to-eco-green/[0.02]" />

      {/* Simulated topographic / road lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        {terrainPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="rgba(55,184,255,0.08)"
            strokeWidth="1"
            strokeDasharray="8,12"
          />
        ))}
        {/* Simulated zone borders */}
        <rect x="10%" y="15%" width="30%" height="35%" fill="none" stroke="rgba(43,255,136,0.06)" strokeWidth="1" strokeDasharray="6,6" rx="4" />
        <rect x="45%" y="10%" width="35%" height="40%" fill="none" stroke="rgba(255,176,32,0.06)" strokeWidth="1" strokeDasharray="6,6" rx="4" />
        <rect x="5%" y="55%" width="40%" height="30%" fill="none" stroke="rgba(55,184,255,0.06)" strokeWidth="1" strokeDasharray="6,6" rx="4" />
        <rect x="50%" y="55%" width="40%" height="35%" fill="none" stroke="rgba(255,59,59,0.06)" strokeWidth="1" strokeDasharray="6,6" rx="4" />

        {/* Zone labels */}
        <text x="25%" y="17%" fill="rgba(43,255,136,0.2)" fontSize="10" fontFamily="monospace" textAnchor="middle">ZONE ALPHA</text>
        <text x="62%" y="12%" fill="rgba(255,176,32,0.2)" fontSize="10" fontFamily="monospace" textAnchor="middle">ZONE BRAVO</text>
        <text x="25%" y="57%" fill="rgba(55,184,255,0.2)" fontSize="10" fontFamily="monospace" textAnchor="middle">ZONE CHARLIE</text>
        <text x="70%" y="57%" fill="rgba(255,59,59,0.2)" fontSize="10" fontFamily="monospace" textAnchor="middle">ZONE DELTA</text>

        {/* Simulated roads */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
        <line x1="10%" y1="0" x2="90%" y2="100%" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
        <line x1="90%" y1="0" x2="10%" y2="100%" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
      </svg>

      {/* Heatmap blobs */}
      {heatmapBlobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[50px]"
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            backgroundColor: blob.color,
            transform: "translate(-50%, -50%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Markers */}
      {markers.map((marker, i) => {
        const styles = getMarkerStyles(marker.type)
        return (
          <motion.div
            key={marker.label}
            className="absolute flex flex-col items-center group"
            style={{ left: marker.x, top: marker.y, transform: "translate(-50%, -50%)" }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4, type: "spring" }}
          >
            {/* Ping ring */}
            <motion.div
              className="absolute w-10 h-10 rounded-full border"
              style={{ borderColor: `${styles.color}40` }}
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
            />
            {/* Second ping ring */}
            <motion.div
              className="absolute w-10 h-10 rounded-full border"
              style={{ borderColor: `${styles.color}25` }}
              animate={{ scale: [1, 3], opacity: [0.3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 + 0.8 }}
            />

            {/* Icon */}
            <div
              className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border"
              style={{
                backgroundColor: styles.bg,
                borderColor: `${styles.color}50`,
                color: styles.color,
                filter: `drop-shadow(0 0 8px ${styles.color}60)`,
              }}
            >
              {styles.icon}
            </div>

            {/* Label */}
            <div
              className="mt-1.5 px-2 py-1 rounded-sm bg-eco-bg/90 border z-10"
              style={{ borderColor: `${styles.color}30` }}
            >
              <span
                className="text-[8px] font-mono font-bold tracking-wider block"
                style={{ color: styles.color }}
              >
                {marker.label}
              </span>
            </div>

            {/* Hover tooltip */}
            <div
              className="absolute top-full mt-8 px-3 py-2 rounded-sm bg-eco-bg/95 border backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap"
              style={{ borderColor: `${styles.color}30` }}
            >
              <span className="text-[10px] font-mono text-eco-text">{marker.detail}</span>
            </div>
          </motion.div>
        )
      })}

      {/* Corner HUD Labels */}
      <div className="absolute top-14 left-4 z-10 flex flex-col gap-1.5 text-[9px] font-mono text-eco-text-dim">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm">
          <Crosshair size={10} className="text-eco-blue" />
          <span className="text-eco-blue">LAT</span>
          <span className="text-eco-text">37.7749</span>
          <span className="text-eco-text-dim mx-1">|</span>
          <span className="text-eco-blue">LNG</span>
          <span className="text-eco-text">-122.4194</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm">
          <Wind size={10} className="text-eco-green" />
          <span className="text-eco-green">WIND</span>
          <span className="text-eco-text">NW 23 kn</span>
          <span className="text-eco-text-dim mx-1">|</span>
          <span className="text-eco-amber">GUST</span>
          <span className="text-eco-text">41 kn</span>
        </div>
      </div>

      <div className="absolute top-14 right-4 z-10 flex flex-col gap-1.5 text-[9px] font-mono">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm">
          <Compass size={10} className="text-eco-amber" />
          <span className="text-eco-amber">ZOOM</span>
          <span className="text-eco-text">12.4x</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm">
          <span className="text-eco-text-dim">MAPBOX</span>
          <span className="text-eco-text-dim mx-1">|</span>
          <span className="text-eco-blue">SATELLITE</span>
        </div>
      </div>

      {/* Crosshair center overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <line x1="30" y1="0" x2="30" y2="22" stroke="#37b8ff" strokeWidth="0.5" opacity="0.3" />
          <line x1="30" y1="38" x2="30" y2="60" stroke="#37b8ff" strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="30" x2="22" y2="30" stroke="#37b8ff" strokeWidth="0.5" opacity="0.3" />
          <line x1="38" y1="30" x2="60" y2="30" stroke="#37b8ff" strokeWidth="0.5" opacity="0.3" />
          <circle cx="30" cy="30" r="4" fill="none" stroke="#37b8ff" strokeWidth="0.5" opacity="0.4" />
          <circle cx="30" cy="30" r="12" fill="none" stroke="#37b8ff" strokeWidth="0.3" opacity="0.2" />
        </svg>
      </div>

      {/* Bottom stat bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-6 px-6 py-2.5 bg-eco-surface/90 border-t border-eco-border backdrop-blur-sm">
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <Flame size={10} className="text-[#ff3b3b]" />
          <span className="text-eco-text-dim">ACTIVE FIRES:</span>
          <span className="text-[#ff3b3b] font-bold">3</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <CircleAlert size={10} className="text-[#37b8ff]" />
          <span className="text-eco-text-dim">POTHOLES / HAZARDS:</span>
          <span className="text-[#37b8ff] font-bold">3</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <CloudAlert size={10} className="text-[#ffb020]" />
          <span className="text-eco-text-dim">AIR QUALITY ALERTS:</span>
          <span className="text-[#ffb020] font-bold">4</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[9px] font-mono">
          <span className="text-eco-text-dim">TOTAL MARKERS:</span>
          <span className="text-eco-text font-bold">{markers.length}</span>
          <span className="text-eco-text-dim ml-2">|</span>
          <span className="text-eco-text-dim ml-2">LAST UPDATE:</span>
          <motion.span
            className="text-eco-green font-bold"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            LIVE
          </motion.span>
        </div>
      </div>
    </div>
  )
}
