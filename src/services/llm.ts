import OpenAI from "openai";

// Gemini API via OpenAI-compatible endpoint.
// Uses GEMINI_API_KEY from environment.
// Model string format: "gemini-2.5-flash", "gemini-2.0-flash", etc.
// Full model list: https://ai.google.dev/gemini-api/docs/models

// Singleton: the first apiKey wins for the lifetime of the process.
let client: OpenAI | null = null;

export function getClient(apiKey: string): OpenAI {
  if (!client) {
    const key = apiKey || process.env.GEMINI_API_KEY || "";
    if (!key) {
      throw new Error(
        "Missing Gemini API key. Set GEMINI_API_KEY environment variable or pass apiKey directly.",
      );
    }
    client = new OpenAI({
      apiKey: key,
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
