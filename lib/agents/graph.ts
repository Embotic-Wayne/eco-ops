import { StateGraph, END, START, Annotation } from "@langchain/langgraph"
import { BaseMessage } from "@langchain/core/messages"
import { HazardData } from "./state"
import { clarificationNode } from "./nodes/clarification"
import { impactNode } from "./nodes/impact"
import { actionNode } from "./nodes/action"
import { briefingNode } from "./nodes/briefing"

// Define state annotation with reducers
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left: BaseMessage[], right: BaseMessage | BaseMessage[]) => {
      if (Array.isArray(right)) {
        return left.concat(right)
      }
      return left.concat([right])
    },
    default: () => [],
  }),
  hazard_data: Annotation<HazardData | undefined>({
    reducer: (left: HazardData | undefined, right: HazardData | undefined) => right ?? left,
    default: () => undefined,
  }),
  severity: Annotation<number | undefined>({
    reducer: (left: number | undefined, right: number | undefined) => right ?? left,
    default: () => undefined,
  }),
  population_affected: Annotation<number | undefined>({
    reducer: (left: number | undefined, right: number | undefined) => right ?? left,
    default: () => undefined,
  }),
  action_plan: Annotation<string[] | undefined>({
    reducer: (left: string[] | undefined, right: string[] | undefined) => right ?? left,
    default: () => undefined,
  }),
  greenpt_score: Annotation<number | undefined>({
    reducer: (left: number | undefined, right: number | undefined) => right ?? left,
    default: () => undefined,
  }),
  final_report: Annotation<string | undefined>({
    reducer: (left: string | undefined, right: string | undefined) => right ?? left,
    default: () => undefined,
  }),
  reasoning_log: Annotation<string[]>({
    reducer: (left: string[], right: string | string[]) => {
      if (Array.isArray(right)) {
        return left.concat(right)
      }
      return left.concat([right])
    },
    default: () => [],
  }),
  clarification_question: Annotation<string | undefined>({
    reducer: (left: string | undefined, right: string | undefined) => right ?? left,
    default: () => undefined,
  }),
})

// Define the graph workflow
const workflow = new StateGraph(StateAnnotation)

// Add nodes
workflow.addNode("clarification", clarificationNode)
workflow.addNode("impact", impactNode)
workflow.addNode("action", actionNode)
workflow.addNode("briefing", briefingNode)

// Define the sequential flow: START -> clarification -> impact -> action -> briefing -> END
workflow.addEdge(START, "clarification")
workflow.addEdge("clarification", "impact")
workflow.addEdge("impact", "action")
workflow.addEdge("action", "briefing")
workflow.addEdge("briefing", END)

// Compile the graph
export const graph = workflow.compile()
