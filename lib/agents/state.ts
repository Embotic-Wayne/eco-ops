import { BaseMessage } from "@langchain/core/messages"

export interface HazardData {
  type: string
  location: string
}

export interface GraphState {
  messages: BaseMessage[]
  clarification_question?: string
  hazard_data?: HazardData
  severity?: number // 1-10
  population_affected?: number
  action_plan?: string[]
  greenpt_score?: number // 0-100
  final_report?: string
  reasoning_log?: string[]
}
