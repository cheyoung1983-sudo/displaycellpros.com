import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
// Import your existing app logic from server.ts
import {app} from "../../server";

setGlobalOptions({maxInstances: 10});

// Export the 'api' function that matches the rewrite rule
export const api = onRequest({maxInstances: 10}, app);
