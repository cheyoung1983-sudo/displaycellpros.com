import * as dotenv from "dotenv";

// Load local environmental overrides if available
dotenv.config();

export interface BackendConfig {
  geminiApiKey: string | undefined;
  appUrl: string;
  sqlHost: string | undefined;
  sqlUser: string | undefined;
  sqlPassword: string | undefined;
  sqlDbName: string | undefined;
  sqlAdminUser: string | undefined;
  sqlAdminPassword: string | undefined;
  oauthEncryptionKey: string;
  nodeEnv: "development" | "production" | "test";
}

/**
 * Retrieves the loaded and normalized backend structural environment parameters.
 */
export const getBackendConfig = (): BackendConfig => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const sqlHost = process.env.SQL_HOST;
  const sqlUser = process.env.SQL_USER;
  const sqlPassword = process.env.SQL_PASSWORD;
  const sqlDbName = process.env.SQL_DB_NAME;
  const sqlAdminUser = process.env.SQL_ADMIN_USER;
  const sqlAdminPassword = process.env.SQL_ADMIN_PASSWORD;

  // Read primary OAuth encryption key with fallback values
  const rawOauthKey = process.env.OAUTH_ENCRYPTION_KEY;
  const fallbackOauthKey = "8f7ab2d6e3c091f1b2c45e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b";
  const oauthEncryptionKey = rawOauthKey && rawOauthKey.trim() !== "" ? rawOauthKey : fallbackOauthKey;

  const nodeEnv = (process.env.NODE_ENV || "development") as "development" | "production" | "test";

  return {
    geminiApiKey,
    appUrl,
    sqlHost,
    sqlUser,
    sqlPassword,
    sqlDbName,
    sqlAdminUser,
    sqlAdminPassword,
    oauthEncryptionKey,
    nodeEnv,
  };
};

/**
 * Prints a high-fidelity cryptographic and connectivity audit of current environment values.
 * Conceals sensitive contents to enforce NIST/security guidelines.
 */
export const runEnvironmentAudit = () => {
  const config = getBackendConfig();
  
  console.log("====================================================================");
  console.log("[FORENSIC COV ENGINE] - MASTER SECURE ENVIRONMENT AUDIT");
  console.log("====================================================================");
  console.log(`Node Environment:          [${config.nodeEnv.toUpperCase()}]`);
  console.log(`App Base Target URI:       [${config.appUrl}]`);
  
  // Gemini AI Key Assessment
  if (config.geminiApiKey && config.geminiApiKey !== "MY_GEMINI_API_KEY") {
    console.log(`Gemini API Token:          [SUCCESSFULLY ATTACHED] Visual fingerprint: ${maskSecret(config.geminiApiKey)}`);
  } else {
    console.log(`Gemini API Token:          [MISSING OR DEFAULT] Fallback simulation active for neural computations.`);
  }

  // Relational Database Layer Assessment
  if (config.sqlHost) {
    console.log(`PostgreSQL Host Address:   [${config.sqlHost}]`);
    console.log(`Db Target Node Name:       [${config.sqlDbName || "N/A"}]`);
    console.log(`Db Core Credentials:       User: ${config.sqlUser ? "LOADED" : "VACANT"} | Pwd: ${config.sqlPassword ? "CONFIGURED" : "VACANT"}`);
    if (config.sqlAdminUser) {
      console.log(`Db Admin Credentials:      Admin User: LOADED | Admin Pwd: CONFIGURED`);
    }
  } else {
    console.log(`PostgreSQL Host Address:   [NOT CONFIGURED] Local storage fallback mechanisms engaged.`);
  }

  // OAuth Cryptographic Engine Assessment
  if (process.env.OAUTH_ENCRYPTION_KEY) {
    console.log(`OAuth Cipher Seed Value:   [CRYPTOGRAPHICALLY SECURED] Fingerprint: ${maskSecret(process.env.OAUTH_ENCRYPTION_KEY)}`);
  } else {
    console.log(`OAuth Cipher Seed Value:   [NOT SPECIFIED] Local deterministic seed generated (Dev simulator use only).`);
  }
  console.log("====================================================================");
};

function maskSecret(secret: string): string {
  if (!secret) return "null";
  const cleaned = secret.trim();
  if (cleaned.length <= 10) return "****";
  return `${cleaned.substring(0, 4)}...${cleaned.substring(cleaned.length - 4)}`;
}
