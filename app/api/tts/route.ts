import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

type TtsRequest = {
  text: string
  reference_id?: string
  format?: "mp3" | "wav" | "pcm" | "opus"
  mp3_bitrate?: 64 | 128 | 192
  latency?: "normal" | "balanced"
  chunk_length?: number
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.FISH_AUDIO_API_KEY
    if (!apiKey) {
      console.error("[TTS API] FISH_AUDIO_API_KEY is not set")
      return NextResponse.json(
        { error: "FISH_AUDIO_API_KEY is not set" },
        { status: 500 }
      )
    }

    const body = (await req.json()) as Partial<TtsRequest>
    const text = (body.text ?? "").trim()
    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 })
    }

    const model = process.env.FISH_AUDIO_MODEL || "s1"
    const referenceId =
      body.reference_id || process.env.FISH_AUDIO_REFERENCE_ID || undefined

    // Defaults tuned for short operator prompts.
    const format: TtsRequest["format"] = body.format ?? "mp3"
    const mp3Bitrate: TtsRequest["mp3_bitrate"] = body.mp3_bitrate ?? 128
    const latency: TtsRequest["latency"] = body.latency ?? "balanced"
    const chunkLength = body.chunk_length ?? 200

    const requestBody = {
      text,
      ...(referenceId ? { reference_id: referenceId } : {}),
      format,
      ...(format === "mp3" ? { mp3_bitrate: mp3Bitrate } : {}),
      latency,
      chunk_length: chunkLength,
    }

    console.log(`[TTS API] Calling Fish Audio with model=${model}, referenceId=${referenceId || "none"}, text="${text.substring(0, 50)}..."`)

    const upstream = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        model,
      },
      body: JSON.stringify(requestBody),
    })

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "")
      console.error(`[TTS API] Fish Audio error ${upstream.status}:`, errText)
      return NextResponse.json(
        { error: "Fish Audio TTS failed", status: upstream.status, details: errText },
        { status: 502 }
      )
    }

    console.log(`[TTS API] Fish Audio success, streaming audio...`)

    const contentType =
      upstream.headers.get("content-type") ||
      (format === "mp3"
        ? "audio/mpeg"
        : format === "opus"
          ? "audio/ogg"
          : format === "wav"
            ? "audio/wav"
            : "application/octet-stream")

    // Stream-through response (works well for short clips too)
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: "TTS route error", details: String(e?.message ?? e) },
      { status: 500 }
    )
  }
}

