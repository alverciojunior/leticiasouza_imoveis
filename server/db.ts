import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, appointments, InsertAppointment, properties, InsertProperty, propertyImages, InsertPropertyImage, propertyViews, InsertPropertyView, adminUsers, InsertAdminUser } from "../drizzle/schema";
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
    // Retornar o ID da propriedade criada
    // Drizzle retorna um array com o resultado do insert
    const insertedId = (result as any)?.[0]?.insertId || (result as any)?.insertId;
    if (!insertedId) {
      throw new Error("Failed to get inserted property ID");
    }
    return { id: Number(insertedId) };
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

export async function deleteAllPropertyImages(propertyId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.delete(propertyImages).where(eq(propertyImages.propertyId, propertyId));
    console.log(`[Database] Deleted all images for property ${propertyId}`);
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete all property images:", error);
    throw error;
  }
}


export async function markPropertyAsSold(propertyId: number, sold: boolean) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.update(properties).set({ sold: sold ? 1 : 0 }).where(eq(properties.id, propertyId));
    console.log(`[Database] Property ${propertyId} marked as ${sold ? 'sold' : 'available'}`);
    return result;
  } catch (error) {
    console.error("[Database] Failed to mark property as sold:", error);
    throw error;
  }
}

export async function recordPropertyView(propertyId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record view: database not available");
    return;
  }

  try {
    await db.insert(propertyViews).values({ propertyId });
  } catch (error) {
    console.error("[Database] Failed to record property view:", error);
  }
}

export async function getPropertyStats(propertyId: number) {
  const db = await getDb();
  if (!db) {
    return { views: 0, appointments: 0 };
  }

  try {
    const viewsResult = await db.select().from(propertyViews).where(eq(propertyViews.propertyId, propertyId));
    const appointmentsResult = await db.select().from(appointments).where(eq(appointments.propertyId, propertyId));
    
    return {
      views: viewsResult.length,
      appointments: appointmentsResult.length,
    };
  } catch (error) {
    console.error("[Database] Failed to get property stats:", error);
    return { views: 0, appointments: 0 };
  }
}

export async function getAllPropertiesStats() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    const allProperties = await db.select().from(properties);
    const stats = await Promise.all(
      allProperties.map(async (prop) => {
        const { views, appointments: appointmentCount } = await getPropertyStats(prop.id);
        return {
          id: prop.id,
          title: prop.title,
          views,
          appointments: appointmentCount,
        };
      })
    );
    return stats;
  } catch (error) {
    console.error("[Database] Failed to get all properties stats:", error);
    return [];
  }
}

export async function getAppointmentStats() {
  const db = await getDb();
  if (!db) {
    return { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  }

  try {
    const allAppointments = await db.select().from(appointments);
    
    return {
      total: allAppointments.length,
      pending: allAppointments.filter(a => a.status === "pending").length,
      confirmed: allAppointments.filter(a => a.status === "confirmed").length,
      completed: allAppointments.filter(a => a.status === "completed").length,
      cancelled: allAppointments.filter(a => a.status === "cancelled").length,
    };
  } catch (error) {
    console.error("[Database] Failed to get appointment stats:", error);
    return { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  }
}

export async function getTotalViews() {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  try {
    const result = await db.select().from(propertyViews);
    return result.length;
  } catch (error) {
    console.error("[Database] Failed to get total views:", error);
    return 0;
  }
}

// Admin User Management
export async function getAdminByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get admin by email:", error);
    return null;
  }
}

export async function createAdminUser(admin: InsertAdminUser) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(adminUsers).values(admin);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create admin user:", error);
    throw error;
  }
}

export async function updateAdminPassword(email: string, passwordHash: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.email, email));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update admin password:", error);
    throw error;
  }
}

export async function getAllAdminUsers() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    const result = await db.select().from(adminUsers);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get admin users:", error);
    return [];
  }
}
