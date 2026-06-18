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

// Define relationships for standard querying.
export const usersRelations = relations(users, ({ many }) => ({
  repairTickets: many(repairTickets),
  highPriorityLeads: many(highPriorityLeads),
  s2cFeedback: many(s2cFeedback),
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
