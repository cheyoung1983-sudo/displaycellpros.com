import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp, real } from "drizzle-orm/pg-core";

// Define the 'users' table.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the 'repair_tickets' table.
export const repairTickets = pgTable("repair_tickets", {
  id: text("id").primaryKey(), // Firestore ID or UUID
  customerName: text("customer_name").notNull(),
  companyName: text("company_name"),
  device: text("device").notNull(),
  issueType: text("issue_type").notNull(),
  status: text("status").notNull(),
  quotedPrice: real("quoted_price").notNull(),
  tax: real("tax").notNull(),
  discount: real("discount").notNull(),
  total: real("total").notNull(),
  createdAt: text("created_at").notNull(),
  userId: text("user_id").references(() => users.uid),
  internalNotes: text("internal_notes"),
  completedAt: text("completed_at"),
});

// Define the 'high_priority_leads' table.
export const highPriorityLeads = pgTable("high_priority_leads", {
  id: text("id").primaryKey(), // ID UUID/String
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  deviceModel: text("device_model").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  userId: text("user_id").references(() => users.uid).notNull(),
});

// Define the 's2c_feedback' table.
export const s2cFeedback = pgTable("s2c_feedback", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.uid),
  pathway: text("pathway").notNull(),
  rating: text("rating").notNull(),
  deviceModel: text("device_model").notNull(),
  notes: text("notes"),
  ammeterReading: real("ammeter_reading").notNull(),
  batteryTemp: real("battery_temp").notNull(),
  createdAt: text("created_at").notNull(),
});

// Define the 'encrypted_oauth_credentials' table for offline Google API token management.
export const encryptedOauthCredentials = pgTable("encrypted_oauth_credentials", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.uid).notNull(),
  accessTokenEncrypted: text("access_token_encrypted").notNull(),
  refreshTokenEncrypted: text("refresh_token_encrypted").notNull(),
  scope: text("scope").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define the 's2c_diagnostic_database' table for offline Symptom-to-Circuit mapping.
export const s2cDiagnosticDatabase = pgTable("s2c_diagnostic_database", {
  id: serial("id").primaryKey(),
  modelName: text("model_name").notNull(), // e.g., "iPhone 11", "Galaxy S21"
  symptomCode: text("symptom_code").notNull(), // e.g., "STATIC_DRAW_100MA", "SHORT_VDD_MAIN"
  circuitLine: text("circuit_line").notNull(), // e.g., "PP_VDD_MAIN", "VBUS_OVP"
  diodeResistanceValue: real("diode_resistance_value"), // Diode mode drop value, e.g., 0.342
  expectedAmmeterDrawRange: text("expected_ammeter_draw_range").notNull(), // e.g., "0.08A-0.12A"
  associatedComponent: text("associated_component").notNull(), // Target chip/filter e.g., "Tristar 1610A3", "FL1728"
  reworkTemperatureProfile: text("rework_temperature_profile").notNull(), // e.g., "SAC305 @ 380°C"
  repairProcedureSteps: text("repair_procedure_steps").notNull(), // Detailed markdown or instruction steps
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relationships for standard querying.
export const usersRelations = relations(users, ({ many }) => ({
  repairTickets: many(repairTickets),
  highPriorityLeads: many(highPriorityLeads),
  s2cFeedback: many(s2cFeedback),
  encryptedOauthCredentials: many(encryptedOauthCredentials),
}));

export const repairTicketsRelations = relations(repairTickets, ({ one }) => ({
  user: one(users, {
    fields: [repairTickets.userId],
    references: [users.uid],
  }),
}));

export const highPriorityLeadsRelations = relations(highPriorityLeads, ({ one }) => ({
  user: one(users, {
    fields: [highPriorityLeads.userId],
    references: [users.uid],
  }),
}));

export const s2cFeedbackRelations = relations(s2cFeedback, ({ one }) => ({
  user: one(users, {
    fields: [s2cFeedback.userId],
    references: [users.uid],
  }),
}));
