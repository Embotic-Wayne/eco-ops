import { HumanMessage } from "@langchain/core/messages"
import { GraphState } from "../state"
import { getModel } from "../llm"

export async function clarificationNode(state: GraphState): Promise<Partial<GraphState>> {
  const model = getModel()

  const messageText = state.messages
    .map((msg) => {
      if (msg instanceof HumanMessage) {
        return msg.content
      }
      return typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
    })
    .join("\n")

  const prompt = `You are an EcoOps Command Center operator. A citizen has just reported an environmental incident. Your goal is to gather more information.

Report from citizen:
"""
${messageText}
"""

Respond with exactly ONE short follow-up question (1-2 sentences) to learn more. Ask about: location details, scale, people affected, time of onset, or anything that would help assess severity. Be professional and concise. Do not include any prefix like "Question:" or quotes—output only the question.`

  const response = await model.invoke([new HumanMessage(prompt)])
  const question =
    typeof response.content === "string"
      ? response.content.trim()
      : JSON.stringify(response.content)

  return {
    clarification_question: question,
  }
}
