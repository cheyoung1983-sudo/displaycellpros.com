import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
import {app} from "../../server";

setGlobalOptions({ maxInstances: 10 });

export const api = onRequest({ maxInstances: 10 }, app);
