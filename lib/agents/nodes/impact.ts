import { HumanMessage } from "@langchain/core/messages"
import { GraphState } from "../state"
import { getModel } from "../llm"

export async function impactNode(state: GraphState): Promise<Partial<GraphState>> {
  const model = getModel()
  
  // Extract text from messages
  const messageText = state.messages
    .map((msg) => {
      if (msg instanceof HumanMessage) {
        return msg.content
      }
      return typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
    })
    .join("\n")

  const prompt = `You are an Impact Assessment Agent for EcoOps Command Center. Analyze the following environmental incident report and extract:

1. Hazard type (e.g., "chemical leak", "wildfire", "flood")
2. Location (specific area mentioned)
3. Severity score (1-10, where 10 is critical/immediate danger)
4. Estimated population affected (number of people)

Respond ONLY with a JSON object in this exact format:
{
  "hazard_type": "string",
  "location": "string",
  "severity": number (1-10),
  "population_affected": number,
  "summary": "brief one-sentence summary"
}

Incident Report:
${messageText}`

  const response = await model.invoke([new HumanMessage(prompt)])
  const responseText = typeof response.content === "string" ? response.content : JSON.stringify(response.content)
  
  // Extract JSON from response (handle markdown code blocks if present)
  let jsonText = responseText.trim()
  if (jsonText.includes("```json")) {
    jsonText = jsonText.split("```json")[1].split("```")[0].trim()
  } else if (jsonText.includes("```")) {
    jsonText = jsonText.split("```")[1].split("```")[0].trim()
  }

  let parsed
  try {
    parsed = JSON.parse(jsonText)
  } catch (e) {
    // Fallback: try to extract values with regex if JSON parsing fails
    const severityMatch = responseText.match(/severity[":\s]+(\d+)/i)
    const typeMatch = responseText.match(/hazard_type[":\s]+"([^"]+)"/i) || responseText.match(/type[":\s]+"([^"]+)"/i)
    const locationMatch = responseText.match(/location[":\s]+"([^"]+)"/i)
    const popMatch = responseText.match(/population[":\s]+(\d+)/i)
    
    parsed = {
      hazard_type: typeMatch?.[1] || "unknown",
      location: locationMatch?.[1] || "unknown",
      severity: severityMatch ? parseInt(severityMatch[1]) : 5,
      population_affected: popMatch ? parseInt(popMatch[1]) : 0,
      summary: responseText.substring(0, 100),
    }
  }

  return {
    hazard_data: {
      type: parsed.hazard_type || "unknown",
      location: parsed.location || "unknown",
    },
    severity: Math.max(1, Math.min(10, parsed.severity || 5)),
    population_affected: parsed.population_affected || 0,
    reasoning_log: [
      ...(state.reasoning_log || []),
      `Impact Agent: Analyzed incident - ${parsed.summary || "Assessment complete"}`,
    ],
  }
}
