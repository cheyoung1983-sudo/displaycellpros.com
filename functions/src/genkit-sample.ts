import {genkit, z} from "genkit";
import {vertexAI} from "@genkit-ai/google-genai";

// Cloud Functions for Firebase supports Genkit natively. The onCallGenkit
// function creates a callable function from a Genkit action.
import {onCallGenkit} from "firebase-functions/https";

// Gemini Developer API models and Vertex Express Mode models depend on an
// API key. Store API keys in Cloud Secret Manager.
import {defineSecret} from "firebase-functions/params";
const apiKey = defineSecret("GOOGLE_GENAI_API_KEY");

// The Firebase telemetry plugin exports a combination of metrics, traces,
// and logs to Google Cloud Observability.
import {enableFirebaseTelemetry} from "@genkit-ai/firebase";
enableFirebaseTelemetry();

const ai = genkit({
  plugins: [
    // Load the VertexAI provider.
    vertexAI({location: "global"}),
  ],
});

// Define a simple flow that prompts an LLM to generate menu suggestions.
const menuSuggestionFlow = ai.defineFlow({
  name: "menuSuggestionFlow",
  inputSchema: z.string().describe("A restaurant theme").default("seafood"),
  outputSchema: z.string(),
  streamSchema: z.string(),
}, async (subject, {sendChunk}) => {
  // Construct a request and send it to the model API.
  const prompt =
      `Suggest an item for the menu of a ${subject} themed restaurant`;
  const {response, stream} = ai.generateStream({
    model: vertexAI.model("gemini-2.5-flash"),
    prompt: prompt,
    config: {
      temperature: 1,
    },
  });

  for await (const chunk of stream) {
    sendChunk(chunk.text);
  }

  return (await response).text;
});

export const menuSuggestion = onCallGenkit({
  // Grant access to the API key to this function:
  secrets: [apiKey],
}, menuSuggestionFlow);
