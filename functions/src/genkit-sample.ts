import {genkit, z} from "genkit";
import {vertexAI} from "@genkit-ai/google-genai";

// Cloud Functions for Firebase supports Genkit natively.
// See https://firebase.google.com/docs/functions
import {onCallGenkit} from "firebase-functions/https";

> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
> `update_todo_list`  — ok

> `read_file` functions/src/genkit-sample.ts — ok

> `update_todo_list`  — ok
// Store API keys in Cloud Secret Manager.
import {defineSecret} from "firebase-functions/params";
const apiKey = defineSecret("GOOGLE_GENAI_API_KEY");

// The Firebase telemetry plugin exports metrics, traces, and logs.
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

  // Handle the response from the model API.
  return (await response).text;
});

export const menuSuggestion = onCallGenkit({
  // Grant access to the API key to this function:
  secrets: [apiKey],
}, menuSuggestionFlow);
