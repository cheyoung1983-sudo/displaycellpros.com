"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuSuggestion = void 0;
const firebase_functions_1 = require("firebase-functions");
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance.
(0, firebase_functions_1.setGlobalOptions)({ maxInstances: 10 });
var genkit_sample_1 = require("./genkit-sample");
Object.defineProperty(exports, "menuSuggestion", { enumerable: true, get: function () { return genkit_sample_1.menuSuggestion; } });
//# sourceMappingURL=index.js.map