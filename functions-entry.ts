import { onRequest } from "firebase-functions/v2/https";
import { app } from "./server";

/**
 * Firebase Cloud Function wrapping the Express app.
 * All /api traffic will be routed here.
 */
export const api = onRequest({
  region: "us-central1",
  memory: "256MiB",
  maxInstances: 10,
}, app);
