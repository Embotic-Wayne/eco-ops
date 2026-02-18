"use client"

import { useState, useCallback, useRef } from "react"
import { CommandHeader } from "@/components/command-header"
import { TacticalMap } from "@/components/tactical-map"
import { IncidentFeed, type Incident, severityFromLevel, iconFromHazardType } from "@/components/incident-feed"
import { TerminalDock } from "@/components/terminal-dock"
import { ReasoningLogs } from "@/components/reasoning-logs"
import { GeocodingCore } from "@mapbox/search-js-core"
import { speakText } from "@/lib/utils/speech"

interface AgentOutputs {
  impact?: {
    severity?: number
    population_affected?: number
    hazard_data?: { type: string; location: string }
  }
  action?: {
    action_plan?: string[]
    greenpt_score?: number
  }
  briefing?: {
    final_report?: string
  }
}

function formatTime() {
  const d = new Date()
  return d.toTimeString().slice(0, 8)
}

export default function EcoOpsCommandCenter() {
  const [threatLevel, setThreatLevel] = useState(6)
  const [dispatchArmed, setDispatchArmed] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [agentOutputs, setAgentOutputs] = useState<AgentOutputs>({})
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null)
  const incidentIdRef = useRef(1)

  const handleSeverityResult = useCallback(
    (data: {
      severity: number
      final_report?: string
      action_plan?: string[]
      hazard_data?: { type: string; location: string }
    }) => {
      setThreatLevel(data.severity)
      setDispatchArmed(true)
      const id = `INC-${String(incidentIdRef.current++).padStart(4, "0")}`
      const message =
        data.hazard_data?.type && data.hazard_data?.location
          ? `${data.hazard_data.type} — ${data.hazard_data.location}`
          : data.final_report?.slice(0, 80)?.trim() + (data.final_report && data.final_report.length > 80 ? "…" : "") || "Environmental incident reported"
      // Create incident immediately (coords added after geocoding)
      setIncidents((prev) => [
        {
          id,
          time: formatTime(),
          severity: severityFromLevel(data.severity),
          message,
          icon: iconFromHazardType(data.hazard_data?.type ?? ""),
          dispatched: false,
        },
        ...prev,
      ])

      // If we have a location string, geocode and attach coordinates to the incident + center map
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      const locationText = data.hazard_data?.location
      if (token && token.startsWith("pk.") && locationText) {
        ;(async () => {
          try {
            const geocoding = new GeocodingCore({ accessToken: token })
            const res = await geocoding.forward(locationText, { limit: 1 })
            const feature = res.features?.[0]
            if (!feature) return

            const [longitude, latitude] = feature.geometry.coordinates

            setMapCenter({ latitude, longitude })
            setIncidents((prev) =>
              prev.map((inc) =>
                inc.id === id ? { ...inc, latitude, longitude } : inc
              )
            )
          } catch (e) {
            // Ignore geocoding failures; incident still shows in feed
            console.error("Geocoding failed:", e)
          }
        })()
      }
    },
    []
  )

  const handleAgentStep = useCallback((step: string, payload?: any) => {
    setCurrentStep(step)
    
    // Store agent output
    if (payload) {
      setAgentOutputs((prev) => ({
        ...prev,
        [step]: payload,
      }))
    }
    
    // Mark step as completed after a brief delay
    setTimeout(() => {
      setCompletedSteps((prev) => new Set([...prev, step]))
      setCurrentStep(null)
    }, 500)
  }, [])

  const handleReset = useCallback(() => {
    setCompletedSteps(new Set())
    setCurrentStep(null)
    setAgentOutputs({})
    setDispatchArmed(false)
    setMapCenter(null)
  }, [])

  const handleDispatch = useCallback(() => {
    if (dispatchArmed && incidents.length > 0) {
      const mostRecentIncident = incidents[0]
      
      // Extract location from message (format: "Type — Location" or just description)
      let location = "the reported location"
      if (mostRecentIncident?.message) {
        // Try to extract location after em dash
        const parts = mostRecentIncident.message.split("—")
        if (parts.length > 1) {
          location = parts[1].trim()
        } else {
          // If no em dash, use first part or full message (truncated if too long)
          const msg = parts[0].trim()
          location = msg.length > 50 ? msg.substring(0, 50) + "..." : msg
        }
      }
      
      const dispatchMessage = `Dispatching response unit to ${location}`
      void speakText(dispatchMessage, { rate: 0.9, pitch: 1.0 })
      
      setIncidents((prev) =>
        prev.length > 0
          ? prev.map((inc, i) => (i === 0 ? { ...inc, dispatched: true } : inc))
          : prev
      )
    }
  }, [dispatchArmed, incidents])

  return (
    <div className="w-full flex flex-col bg-eco-bg hex-grid-bg relative">
      {/* CRT Scanlines */}
      <div className="crt-scanlines" />

      {/* Header */}
      <CommandHeader
        threatLevel={threatLevel}
        dispatchArmed={dispatchArmed}
        onDispatch={handleDispatch}
      />

      {/* Main Content */}
      <div className="flex flex-col border-t border-eco-border">
        {/* Top: Three Column Layout (equal width) */}
        <div className="flex h-[65vh] min-h-[520px]">
        {/* Column 1: Field Operative Uplink Terminal / Chat (Left) */}
        <div className="flex-1 min-w-0 border-r border-eco-border">
          <TerminalDock
            onSeverityResult={handleSeverityResult}
            onAgentStep={handleAgentStep}
            onReset={handleReset}
          />
        </div>

        {/* Column 2: Reasoning Logs (Center) */}
        <div className="flex-1 min-w-0 border-r border-eco-border">
          <ReasoningLogs 
            completedSteps={completedSteps} 
            currentStep={currentStep}
            agentOutputs={agentOutputs}
          />
        </div>

        {/* Column 3: Global Incident Feed (Right) */}
        <div className="flex-1 min-w-0">
          <IncidentFeed incidents={incidents} />
        </div>
        </div>

        {/* Bottom: Larger Map Section (scroll down to see) */}
        <div className="h-[85vh] min-h-[700px] border-t border-eco-border flex flex-col">
          <div className="flex-1 p-4 min-h-0">
            <TacticalMap incidents={incidents} center={mapCenter} />
          </div>
        </div>
      </div>
    </div>
  )
}
