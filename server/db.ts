import { eq, and, gte, lt, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  users, 
  sessions, 
  queryHistory, 
  activityLogs, 
  accessTimeAdjustments,
  InsertUser, 
  type User,
  type Session,
  type QueryHistory,
  type ActivityLog,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * User management queries
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createUser(user: {
  email: string;
  password: string;
  name: string;
  accessMinutes: number;
  expiresAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values({
    openId: `local-${Date.now()}-${Math.random()}`,
    email: user.email,
    password: user.password,
    name: user.name,
    accessMinutes: user.accessMinutes,
    expiresAt: user.expiresAt,
    loginMethod: "email",
  });
  return result;
}

export async function updateUser(id: number, updates: Partial<User>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(updates).where(eq(users.id, id));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

/**
 * Session management queries
 */
export async function createSession(userId: number, token: string, ipAddress?: string, userAgent?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await db.insert(sessions).values({
    userId,
    token,
    ipAddress,
    userAgent,
    expiresAt,
  });
}

export async function getSessionByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  return result[0];
}

export async function deleteSession(token: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function getActiveSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions).where(eq(sessions.userId, userId));
}

/**
 * Query history queries
 */
export async function createQueryRecord(record: {
  userId: number;
  queryType: string;
  queryValue: string;
  result?: any;
  status: "success" | "error" | "blocked" | "expired";
  errorMessage?: string;
  ipAddress?: string;
  minutesUsed: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(queryHistory).values(record);
}

export async function getUserQueryHistory(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(queryHistory)
    .where(eq(queryHistory.userId, userId))
    .orderBy(desc(queryHistory.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getQueryHistoryCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: queryHistory.id })
    .from(queryHistory)
    .where(eq(queryHistory.userId, userId));
  return result[0]?.count || 0;
}

/**
 * Activity logs queries
 */
export async function logActivity(activity: {
  userId?: number;
  action: string;
  details?: any;
  ipAddress?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(activity);
}

export async function getActivityLogs(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Access time adjustment queries
 */
export async function addAccessTimeAdjustment(adjustment: {
  userId: number;
  adminId: number;
  minutesAdded: number;
  reason?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(accessTimeAdjustments).values(adjustment);
}
