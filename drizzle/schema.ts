import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with 679 DataConsult fields for access control and time management.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("email"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Access control fields
  accessMinutes: bigint("accessMinutes", { mode: "number" }).default(0).notNull(),
  usedMinutes: bigint("usedMinutes", { mode: "number" }).default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  isBlocked: boolean("isBlocked").default(false).notNull(),
  maxQueries: int("maxQueries").default(0).notNull(),
  queryCount: int("queryCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Sessions table for tracking active user sessions with UUID tokens
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 36 }).notNull().unique(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Query history table for tracking all data consultations
 */
export const queryHistory = mysqlTable("queryHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  queryType: varchar("queryType", { length: 50 }).notNull(), // cpf, cnpj, rg, placa, telefone, cnh, crlv, etc
  queryValue: varchar("queryValue", { length: 255 }).notNull(),
  result: json("result"),
  status: mysqlEnum("status", ["success", "error", "blocked", "expired"]).default("success").notNull(),
  errorMessage: text("errorMessage"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  minutesUsed: int("minutesUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QueryHistory = typeof queryHistory.$inferSelect;
export type InsertQueryHistory = typeof queryHistory.$inferInsert;

/**
 * Activity logs table for audit trail
 */
export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(), // login, logout, query, admin_action, etc
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

/**
 * Access time adjustments table for tracking admin changes
 */
export const accessTimeAdjustments = mysqlTable("accessTimeAdjustments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  adminId: int("adminId").notNull(),
  minutesAdded: bigint("minutesAdded", { mode: "number" }).notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AccessTimeAdjustment = typeof accessTimeAdjustments.$inferSelect;
export type InsertAccessTimeAdjustment = typeof accessTimeAdjustments.$inferInsert;