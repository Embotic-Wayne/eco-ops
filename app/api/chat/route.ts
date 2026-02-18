import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: `You are EcoOps AI, a tactical environmental response intelligence system. You analyze environmental threats including wildfires, floods, air quality crises, severe storms, and ecological hazards. You provide concise, data-driven tactical assessments in a military-style briefing format. Use technical terminology and reference sensor data, satellite imagery, and predictive modeling. Keep responses focused, urgent when warranted, and always recommend actionable next steps. Format critical data points in ALL CAPS for emphasis.`,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
