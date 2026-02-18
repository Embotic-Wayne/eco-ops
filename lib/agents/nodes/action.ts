import { HumanMessage } from "@langchain/core/messages"
import { GraphState } from "../state"
import { getModel } from "../llm"

export async function actionNode(state: GraphState): Promise<Partial<GraphState>> {
  const model = getModel()

  const prompt = `You are an Action Planning Agent for EcoOps Command Center. Based on the following environmental incident assessment, create:

1. A 5-step action checklist (specific, actionable steps)
2. A GreenPT Score (0-100) representing environmental protection and response effectiveness potential

Severity: ${state.severity}/10
Hazard Type: ${state.hazard_data?.type || "unknown"}
Location: ${state.hazard_data?.location || "unknown"}
Population Affected: ${state.population_affected || 0}

Respond ONLY with a JSON object in this exact format:
{
  "action_plan": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "greenpt_score": number (0-100),
  "summary": "brief explanation of the action plan"
}

Make the action steps specific and actionable (e.g., "Deploy boom barriers at river mile 12", "Evacuate residents within 2-mile radius").`

  const response = await model.invoke([new HumanMessage(prompt)])
  const responseText = typeof response.content === "string" ? response.content : JSON.stringify(response.content)
  
  // Extract JSON from response
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
    // Fallback parsing
    const stepsMatch = responseText.match(/action_plan[":\s]*\[(.*?)\]/s)
    const scoreMatch = responseText.match(/greenpt_score[":\s]+(\d+)/i)
    
    const steps = stepsMatch
      ? stepsMatch[1]
          .split(",")
          .map((s) => s.replace(/["\[\]]/g, "").trim())
          .filter((s) => s.length > 0)
          .slice(0, 5)
      : [
          "Assess immediate threat level",
          "Deploy containment measures",
          "Evacuate affected areas",
          "Coordinate with emergency services",
          "Monitor and adjust response",
        ]

    parsed = {
      action_plan: steps,
      greenpt_score: scoreMatch ? parseInt(scoreMatch[1]) : 75,
      summary: responseText.substring(0, 100),
    }
  }

  return {
    action_plan: parsed.action_plan || [],
    greenpt_score: Math.max(0, Math.min(100, parsed.greenpt_score || 75)),
    reasoning_log: [
      ...(state.reasoning_log || []),
      `Action Agent: Generated ${parsed.action_plan?.length || 5} action steps - GreenPT Score: ${parsed.greenpt_score || 75}`,
    ],
  }
}
