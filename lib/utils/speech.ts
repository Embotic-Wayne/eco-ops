/**
 * Text-to-Speech utility.
 *
 * Primary: Fish Audio via our server route (`/api/tts`) for consistent quality.
 * No fallback: If Fish Audio fails, we log and stay silent to avoid overlapping voices.
 */

let currentAudio: HTMLAudioElement | null = null
let currentObjectUrl: string | null = null

function cleanupAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause()
      currentAudio.src = ""
    } catch {
      // ignore
    }
    currentAudio = null
  }
  if (currentObjectUrl) {
    try {
      URL.revokeObjectURL(currentObjectUrl)
    } catch {
      // ignore
    }
    currentObjectUrl = null
  }
}

export async function speakText(
  text: string,
  options?: { rate?: number; pitch?: number; volume?: number }
) {
  if (typeof window === "undefined") return

  // Stop any in-flight speech first.
  window.speechSynthesis.cancel()
  cleanupAudio()

  const trimmed = text.trim()
  if (!trimmed) return

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed, format: "mp3", latency: "balanced", mp3_bitrate: 128 }),
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => "")
      console.error(`[TTS] API error ${res.status}:`, errorText)
      throw new Error(`TTS HTTP ${res.status}: ${errorText}`)
    }

    const blob = await res.blob()
    if (!blob || blob.size === 0) {
      console.error("[TTS] Received empty audio blob")
      throw new Error("Empty audio response")
    }

    console.log(`[TTS] Received audio blob (${blob.size} bytes), type: ${blob.type}`)

    const url = URL.createObjectURL(blob)
    currentObjectUrl = url

    const audio = new Audio(url)
    currentAudio = audio
    audio.volume = options?.volume ?? 0.9

    // Handle audio playback errors
    audio.onerror = (e) => {
      console.error("[TTS] Audio playback error:", e)
      cleanupAudio()
    }

    audio.oncanplaythrough = () => {
      console.log("[TTS] Audio ready to play")
    }

    // Some browsers require a user gesture; if this fails we'll stay silent.
    await audio.play().catch((e) => {
      console.error("[TTS] Audio play() failed:", e)
      cleanupAudio()
    })

    console.log("[TTS] Fish Audio playback started successfully")
  } catch (error) {
    console.error("[TTS] Fish Audio failed (no fallback):", error)
  }
}

export function stopSpeaking() {
  if (typeof window === "undefined") return
  window.speechSynthesis.cancel()
  cleanupAudio()
}
