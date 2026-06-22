import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.ts";
import { getBackendConfig } from "../config/env";

const { Pool } = pg;

export const createPool = () => {
  const cfg = getBackendConfig();
  
  if (!cfg.sqlHost) {
    console.warn("[DATABASE METRICS WARNING] SQL_HOST is not configured in current session variables. SQL queries will be directed to transient fallback systems.");
  }

  return new Pool({
    host: cfg.sqlHost,
    user: cfg.sqlUser,
    password: cfg.sqlPassword,
    database: cfg.sqlDbName,
    connectionTimeoutMillis: 15000,
  });
};

const pool = createPool();

pool.on("error", (err) => {
  console.error("Unexpected error on idle SQL pool client:", err);
});

export const db = drizzle(pool, { schema });
