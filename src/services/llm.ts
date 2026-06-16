 · TS
import OpenAI from "openai";
 
// Gemini API via OpenAI-compatible endpoint.
// Uses GEMINI_API_KEY from environment.
// Model string format: "gemini-2.5-flash", "gemini-2.0-flash", etc.
// Full model list: https://ai.google.dev/gemini-api/docs/models
 
// Singleton: the first apiKey wins for the lifetime of the process.
let client: OpenAI | null = null;
 
export function getClient(apiKey: string): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      maxRetries: 0,
    });
  }
  return client;
}
 
// Reset the client singleton — useful for testing or key rotation.
export function resetClient(): void {
  client = null;
}
