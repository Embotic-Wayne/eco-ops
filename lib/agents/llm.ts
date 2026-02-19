import { ChatGroq } from "@langchain/groq"
import { ChatOpenAI } from "@langchain/openai"

const GREENPT_BASE_URL = "https://api.greenpt.ai/v1"

/** Whether the app is using GreenPT API (sponsor track). Set when GREENPT_API_KEY is present. */
export function isUsingGreenPT(): boolean {
  return Boolean(process.env.GREENPT_API_KEY)
}

/**
 * Returns the LLM for the agent pipeline.
 * If GREENPT_API_KEY is set, uses GreenPT (OpenAI-compatible) for sponsor track integration.
 * Otherwise uses Groq (Llama).
 */
export function getModel() {
  const greenptKey = process.env.GREENPT_API_KEY
  if (greenptKey) {
    return new ChatOpenAI({
      model: process.env.GREENPT_MODEL || "green-l",
      temperature: 0.7,
      apiKey: greenptKey,
      configuration: {
        baseURL: process.env.GREENPT_BASE_URL || GREENPT_BASE_URL,
      },
    })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set (or set GREENPT_API_KEY for GreenPT sponsor track)")
  }

  return new ChatGroq({
    apiKey,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
  })
}
