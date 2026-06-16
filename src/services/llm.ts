import OpenAI from "openai";

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

export function resetClient(): void {
  client = null;
}
