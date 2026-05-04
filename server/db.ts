import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, appointments, InsertAppointment, properties, InsertProperty, propertyImages, InsertPropertyImage } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function createAppointment(appointment: InsertAppointment) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create appointment: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(appointments).values(appointment);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create appointment:", error);
    throw error;
  }
}

export async function getAppointments() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get appointments: database not available");
    return [];
  }

  try {
    const result = await db.select().from(appointments);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get appointments:", error);
    return [];
  }
}

// Property Management
export async function createProperty(property: InsertProperty) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(properties).values(property);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create property:", error);
    throw error;
  }
}

export async function updateProperty(id: number, property: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.update(properties).set(property).where(eq(properties.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update property:", error);
    throw error;
  }
}

export async function getProperties() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    const result = await db.select().from(properties).orderBy(desc(properties.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get properties:", error);
    return [];
  }
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get property:", error);
    return null;
  }
}

export async function deleteProperty(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Delete images first
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, id));
    // Delete property
    const result = await db.delete(properties).where(eq(properties.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete property:", error);
    throw error;
  }
}

export async function addPropertyImage(image: InsertPropertyImage) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(propertyImages).values(image);
    return result;
  } catch (error) {
    console.error("[Database] Failed to add property image:", error);
    throw error;
  }
}

export async function getPropertyImages(propertyId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    const result = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, propertyId)).orderBy(propertyImages.order);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get property images:", error);
    return [];
  }
}

export async function deletePropertyImage(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.delete(propertyImages).where(eq(propertyImages.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete property image:", error);
    throw error;
  }
}
