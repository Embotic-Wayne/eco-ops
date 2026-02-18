import { ChatGroq } from "@langchain/groq"

export function getModel() {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set")
  }

  return new ChatGroq({
    apiKey,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
  })
}
