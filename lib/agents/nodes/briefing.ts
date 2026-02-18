import { HumanMessage } from "@langchain/core/messages"
import { GraphState } from "../state"
import { getModel } from "../llm"

export async function briefingNode(state: GraphState): Promise<Partial<GraphState>> {
  const model = getModel()

  const prompt = `You are a Briefing Agent for EcoOps Command Center. Create a professional 1-page summary report consolidating all assessment data.

Hazard: ${state.hazard_data?.type || "unknown"} at ${state.hazard_data?.location || "unknown"}
Severity: ${state.severity}/10
Population Affected: ${state.population_affected || 0}
Action Plan: ${state.action_plan?.join("; ") || "N/A"}
GreenPT Score: ${state.greenpt_score || 0}/100

Write a comprehensive briefing report (approximately 200-300 words) that includes:
- Executive summary of the incident
- Risk assessment
- Recommended actions
- Resource requirements
- Timeline considerations

Format as a professional operational briefing document.`

  const response = await model.invoke([new HumanMessage(prompt)])
  const finalReport = typeof response.content === "string" ? response.content : JSON.stringify(response.content)

  return {
    final_report: finalReport,
    reasoning_log: [
      ...(state.reasoning_log || []),
      `Briefing Agent: Final report generated - ${finalReport.substring(0, 50)}...`,
    ],
  }
}
