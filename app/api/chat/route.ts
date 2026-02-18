import { NextRequest } from "next/server"
import { HumanMessage } from "@langchain/core/messages"
import { graph } from "@/lib/agents/graph"
import { GraphState } from "@/lib/agents/state"

export const runtime = "nodejs"
export const maxDuration = 60 // 60 seconds max for streaming

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Initialize state with user message
    const initialState: GraphState = {
      messages: [new HumanMessage(message)],
      reasoning_log: [],
    }

    // Create a readable stream for NDJSON
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let currentState: any = { ...initialState }

          // Stream graph execution with updates mode
          // Note: graph.stream() returns a Promise that resolves to an async iterable
          for await (const chunk of await graph.stream(initialState, {
            streamMode: "updates",
          })) {
            // Each chunk contains updates from nodes: { node_name: partial_state_update }
            const nodeNames = Object.keys(chunk)
            
            for (const nodeName of nodeNames) {
              const nodeUpdate = chunk[nodeName]
              
              // Merge the update into current state
              currentState = { ...currentState, ...nodeUpdate }
              
              // Prepare payload based on node type
              let payload: any = {}
              if (nodeName === "impact") {
                payload = {
                  severity: nodeUpdate.severity,
                  population_affected: nodeUpdate.population_affected,
                  hazard_data: nodeUpdate.hazard_data,
                }
              } else if (nodeName === "action") {
                payload = {
                  action_plan: nodeUpdate.action_plan,
                  greenpt_score: nodeUpdate.greenpt_score,
                }
              } else if (nodeName === "briefing") {
                payload = {
                  final_report: nodeUpdate.final_report,
                }
              }
              
              // Send step completion event with agent output
              const stepEvent = {
                step: nodeName,
                payload,
              }
              controller.enqueue(encoder.encode(JSON.stringify(stepEvent) + "\n"))
            }
          }

          // Use accumulated state as final state
          const finalState = currentState

          // Send final payload
          const finalEvent = {
            step: "end",
            payload: {
              severity: finalState.severity,
              action_plan: finalState.action_plan,
              final_report: finalState.final_report,
              greenpt_score: finalState.greenpt_score,
              hazard_data: finalState.hazard_data,
              population_affected: finalState.population_affected,
            },
          }
          controller.enqueue(encoder.encode(JSON.stringify(finalEvent) + "\n"))
          controller.close()
        } catch (error) {
          console.error("Streaming error:", error)
          const errorEvent = {
            step: "error",
            payload: { error: error instanceof Error ? error.message : "Unknown error" },
          }
          controller.enqueue(encoder.encode(JSON.stringify(errorEvent) + "\n"))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("API error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
