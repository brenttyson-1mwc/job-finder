import OpenAI from "openai";

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
