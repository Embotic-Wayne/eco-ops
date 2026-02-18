"use client"

import { useEffect, useState, useMemo } from "react"
import Map, { Marker, NavigationControl, FullscreenControl, useMap } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import { motion, AnimatePresence } from "framer-motion"
import { Crosshair, Wind, Compass, MapPin, Flame, AlertCircle, Cloud, Maximize2, Minimize2 } from "lucide-react"
import type { Incident } from "./incident-feed"

interface TacticalMapProps {
  incidents?: Incident[]
  center?: { latitude: number; longitude: number } | null
}

// Component to add 3D terrain after map loads
function TerrainControl() {
  const { map } = useMap()

  useEffect(() => {
    if (!map) return

    const onStyleLoad = () => {
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        })
      }
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 })
    }

    map.on("style.load", onStyleLoad)
    return () => {
      map.off("style.load", onStyleLoad)
    }
  }, [map])

  return null
}

function getMarkerColor(icon: string, severity?: string) {
  if (icon === "fire") return "#ff3b3b"
  if (icon === "flood") return "#ffb020"
  if (icon === "air") return "#37b8ff"
  if (icon === "storm") return "#37b8ff"
  
  // Fallback to severity-based colors
  switch (severity) {
    case "critical": return "#ff3b3b"
    case "high": return "#ffb020"
    case "elevated": return "#37b8ff"
    default: return "#2bff88"
  }
}

function getMarkerIcon(icon: string) {
  switch (icon) {
    case "fire": return Flame
    case "flood": return AlertCircle
    case "air": return Cloud
    case "storm": return Cloud
    default: return MapPin
  }
}

export function TacticalMap({ incidents = [], center }: TacticalMapProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMapHovered, setIsMapHovered] = useState(false)

  const [viewState, setViewState] = useState<{
    longitude: number
    latitude: number
    zoom: number
    pitch: number
    bearing: number
    transitionDuration?: number
  }>({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 11,
    pitch: 45, // 3D tilt angle
    bearing: 0, // Rotation
  })

  // When a new center is provided (geocoded incident location), pan/zoom to it.
  useEffect(() => {
    if (!center) return

    setViewState((prev) => ({
      ...prev,
      longitude: center.longitude,
      latitude: center.latitude,
      zoom: Math.max(prev.zoom, 13),
      transitionDuration: 1800,
    }))

    const t = setTimeout(() => {
      setViewState((prev) => {
        const { transitionDuration, ...rest } = prev
        return rest
      })
    }, 1800)

    return () => clearTimeout(t)
  }, [center?.latitude, center?.longitude])

  // Generate markers from incidents
  const markers = useMemo(() => {
    return incidents
      .filter((incident) => typeof incident.latitude === "number" && typeof incident.longitude === "number")
      .map((incident) => ({
        ...incident,
        lat: incident.latitude as number,
        lng: incident.longitude as number,
      }))
  }, [incidents])

  // Validate token format
  const isValidToken = useMemo(() => {
    if (!mapboxToken || mapboxToken === "your_mapbox_access_token_here") return false
    // Mapbox public tokens start with pk.
    return mapboxToken.startsWith("pk.")
  }, [mapboxToken])

  if (!isValidToken) {
    return (
      <div className="relative flex-1 bg-eco-bg overflow-hidden tactical-grid border border-eco-border rounded-sm flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-sm font-mono text-eco-text-dim mb-2">
            Mapbox token not configured
          </p>
          <p className="text-xs font-mono text-eco-text-dim/70 mb-1">
            Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to .env.local
          </p>
          <p className="text-xs font-mono text-eco-text-dim/70 mb-2">
            Token must start with <span className="text-eco-blue">pk.</span>
          </p>
          <p className="text-xs font-mono text-eco-text-dim/70">
            Get your token at{" "}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-eco-blue hover:underline"
            >
              account.mapbox.com
            </a>
          </p>
          <p className="text-xs font-mono text-eco-text-dim/50 mt-3 pt-3 border-t border-eco-border">
            Ensure your token has <span className="text-eco-amber">STYLES:READ</span> scope
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-50 bg-eco-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative w-full h-full">
              <div
                className="w-full h-full"
                onMouseEnter={() => setIsMapHovered(true)}
                onMouseLeave={() => setIsMapHovered(false)}
              >
                <Map
                  {...viewState}
                  onMove={(evt) => setViewState(evt.viewState)}
                  mapboxAccessToken={mapboxToken}
                  style={{ width: "100%", height: "100%" }}
                  mapStyle="mapbox://styles/mapbox/standard"
                  reuseMaps={true}
                  attributionControl={false}
                  transitionDuration={viewState.transitionDuration || 0}
                  scrollZoom={isMapHovered}
                >
                <TerrainControl />
                <NavigationControl position="top-right" showCompass={true} />
                <FullscreenControl position="top-right" />
                
                {/* Close button for expanded view */}
                <motion.button
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2 py-1 bg-eco-bg/90 border border-eco-border/50 rounded-sm backdrop-blur-sm hover:bg-eco-bg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Minimize2 size={12} className="text-eco-text" />
                  <span className="text-[9px] font-mono text-eco-text">COLLAPSE</span>
                </motion.button>

                {/* Markers */}
                {markers.map((marker, i) => {
                  const MarkerIcon = getMarkerIcon(marker.icon)
                  const markerColor = getMarkerColor(marker.icon, marker.severity)

                  return (
                    <Marker
                      key={marker.id}
                      longitude={marker.lng}
                      latitude={marker.lat}
                      anchor="bottom"
                    >
                      <motion.div
                        className="flex flex-col items-center gap-1 cursor-pointer"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                      >
                        <motion.div
                          className="absolute w-8 h-8 rounded-full border"
                          style={{ borderColor: `${markerColor}40` }}
                          animate={{
                            scale: [1, 2.5],
                            opacity: [0.6, 0],
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        />
                        <MarkerIcon
                          size={18}
                          style={{
                            color: markerColor,
                            filter: `drop-shadow(0 0 6px ${markerColor}80)`,
                          }}
                        />
                        <span
                          className="text-[8px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-eco-bg/90 border backdrop-blur-sm"
                          style={{
                            color: markerColor,
                            borderColor: `${markerColor}30`,
                          }}
                        >
                          {marker.id}
                        </span>
                      </motion.div>
                    </Marker>
                  )
                })}

                {/* HUD Overlays */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 text-[9px] font-mono text-eco-text-dim">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm backdrop-blur-sm">
                    <Crosshair size={10} className="text-eco-blue" />
                    <span className="text-eco-blue">LAT</span>
                    <span className="text-eco-text">{viewState.latitude.toFixed(4)}</span>
                    <span className="text-eco-text-dim mx-1">|</span>
                    <span className="text-eco-blue">LNG</span>
                    <span className="text-eco-text">{viewState.longitude.toFixed(4)}</span>
                  </div>
                </div>

                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 text-[9px] font-mono">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm backdrop-blur-sm">
                    <Compass size={10} className="text-eco-amber" />
                    <span className="text-eco-amber">ZOOM</span>
                    <span className="text-eco-text">{viewState.zoom.toFixed(1)}x</span>
                    <span className="text-eco-text-dim mx-1">|</span>
                    <span className="text-eco-amber">PITCH</span>
                    <span className="text-eco-text">{Math.round(viewState.pitch)}°</span>
                  </div>
                </div>
                </Map>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regular Map View */}
      <div
        className="relative w-full h-full bg-eco-bg overflow-hidden border border-eco-border rounded-sm min-h-[300px]"
        onMouseEnter={() => setIsMapHovered(true)}
        onMouseLeave={() => setIsMapHovered(false)}
      >
        {/* Expand/Collapse Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2 py-1 bg-eco-bg/90 border border-eco-border/50 rounded-sm backdrop-blur-sm hover:bg-eco-bg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? (
            <>
              <Minimize2 size={12} className="text-eco-text" />
              <span className="text-[9px] font-mono text-eco-text">COLLAPSE</span>
            </>
          ) : (
            <>
              <Maximize2 size={12} className="text-eco-text" />
              <span className="text-[9px] font-mono text-eco-text">EXPAND</span>
            </>
          )}
        </motion.button>

        {/* Helpful overlay while waiting for geocoding */}
        {incidents.length > 0 && markers.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="px-3 py-2 rounded-sm border border-eco-border/50 bg-eco-bg/80 backdrop-blur-sm">
              <span className="text-[10px] font-mono text-eco-text-dim">
                Locating incident coordinates…
              </span>
            </div>
          </div>
        )}

        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapboxAccessToken={mapboxToken}
          style={{ width: "100%", height: "100%", minHeight: "300px" }}
          mapStyle="mapbox://styles/mapbox/standard"
          reuseMaps={true}
          attributionControl={false}
          transitionDuration={viewState.transitionDuration || 0}
          scrollZoom={isMapHovered}
        >
          <TerrainControl />
          <NavigationControl position="top-right" showCompass={true} />
          <FullscreenControl position="top-right" />

          {/* Incident Markers */}
          {markers.map((marker, i) => {
            const MarkerIcon = getMarkerIcon(marker.icon)
            const markerColor = getMarkerColor(marker.icon, marker.severity)

            return (
              <Marker
                key={marker.id}
                longitude={marker.lng}
                latitude={marker.lat}
                anchor="bottom"
              >
                <motion.div
                  className="flex flex-col items-center gap-1 cursor-pointer"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  {/* Ping ring */}
                  <motion.div
                    className="absolute w-8 h-8 rounded-full border"
                    style={{ borderColor: `${markerColor}40` }}
                    animate={{
                      scale: [1, 2.5],
                      opacity: [0.6, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                  <MarkerIcon
                    size={18}
                    style={{
                      color: markerColor,
                      filter: `drop-shadow(0 0 6px ${markerColor}80)`,
                    }}
                  />
                  <span
                    className="text-[8px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-eco-bg/90 border backdrop-blur-sm"
                    style={{
                      color: markerColor,
                      borderColor: `${markerColor}30`,
                    }}
                  >
                    {marker.id}
                  </span>
                </motion.div>
              </Marker>
            )
          })}

          {/* Corner HUD Labels */}
          {/* Top Left - Coordinates */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 text-[9px] font-mono text-eco-text-dim">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm backdrop-blur-sm">
              <Crosshair size={10} className="text-eco-blue" />
              <span className="text-eco-blue">LAT</span>
              <span className="text-eco-text">{viewState.latitude.toFixed(4)}</span>
              <span className="text-eco-text-dim mx-1">|</span>
              <span className="text-eco-blue">LNG</span>
              <span className="text-eco-text">{viewState.longitude.toFixed(4)}</span>
            </div>
          </div>

          {/* Top Right - Zoom */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 text-[9px] font-mono">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm backdrop-blur-sm">
              <Compass size={10} className="text-eco-amber" />
              <span className="text-eco-amber">ZOOM</span>
              <span className="text-eco-text">{viewState.zoom.toFixed(1)}x</span>
              <span className="text-eco-text-dim mx-1">|</span>
              <span className="text-eco-amber">PITCH</span>
              <span className="text-eco-text">{Math.round(viewState.pitch)}°</span>
            </div>
          </div>

          {/* Bottom Left - Wind Info */}
          <div className="absolute bottom-3 left-3 z-10 text-[9px] font-mono">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm backdrop-blur-sm">
              <Wind size={10} className="text-eco-green" />
              <span className="text-eco-green">WIND</span>
              <span className="text-eco-text">NW 23 kn</span>
              <span className="text-eco-text-dim mx-1">|</span>
              <span className="text-eco-amber">GUST</span>
              <span className="text-eco-text">41 kn</span>
            </div>
          </div>

          {/* Bottom Right - Map Info */}
          <div className="absolute bottom-3 right-3 z-10 text-[9px] font-mono">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-eco-bg/80 border border-eco-border/50 rounded-sm backdrop-blur-sm">
              <span className="text-eco-text-dim">MAPBOX</span>
              <span className="text-eco-text-dim mx-1">|</span>
              <span className="text-eco-blue">3D</span>
            </div>
          </div>

          {/* Crosshair center overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <line x1="20" y1="0" x2="20" y2="15" stroke="#37b8ff" strokeWidth="0.5" opacity="0.4" />
              <line x1="20" y1="25" x2="20" y2="40" stroke="#37b8ff" strokeWidth="0.5" opacity="0.4" />
              <line x1="0" y1="20" x2="15" y2="20" stroke="#37b8ff" strokeWidth="0.5" opacity="0.4" />
              <line x1="25" y1="20" x2="40" y2="20" stroke="#37b8ff" strokeWidth="0.5" opacity="0.4" />
              <circle cx="20" cy="20" r="3" fill="none" stroke="#37b8ff" strokeWidth="0.5" opacity="0.5" />
            </svg>
          </div>
        </Map>
      </div>
    </>
  )
}
