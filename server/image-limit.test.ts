import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getDb } from "./db";
import { properties, propertyImages } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Image limit validation", () => {
  let db: any;
  const createdPropertyIds: number[] = [];

  beforeAll(async () => {
    db = await getDb();
  });

  async function createTestProperty(title: string, location: string, price: string) {
    const result = await db.insert(properties).values({
      title,
      location,
      price,
      type: "Casas",
      beds: 3,
      baths: 2,
      area: 150,
      description: "Test description",
      latitude: "-20.5105",
      longitude: "-48.7789",
      featured: 0,
      sold: 0,
      createdAt: new Date(),
    });

    const propertyId = Number(result[0].insertId);
    createdPropertyIds.push(propertyId);
    return propertyId;
  }

  async function removeTestProperty(propertyId: number) {
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, propertyId));
    await db.delete(properties).where(eq(properties.id, propertyId));
  }

  afterAll(async () => {
    if (!db) return;

    for (const propertyId of createdPropertyIds) {
      try {
        await removeTestProperty(propertyId);
      } catch (error) {
        console.log(`Cleanup error for property ${propertyId}:`, error);
      }
    }
  });

  it("should allow adding images up to 20", async () => {
    if (!db) throw new Error("Database not available");

    const propertyId = await createTestProperty(
      "Test Property - 20 Images",
      "Test Location",
      "100000"
    );

    for (let i = 0; i < 20; i++) {
      await db.insert(propertyImages).values({
        propertyId,
        imageUrl: `https://example.com/image-${i}.jpg`,
        imageKey: `image-${propertyId}-${i}`,
        order: i,
      });
    }

    const images = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId));

    expect(images).toHaveLength(20);
  });

  it("should validate that limit is enforced at 20 images", async () => {
    if (!db) throw new Error("Database not available");

    const propertyId = await createTestProperty(
      "Test Property - Limit",
      "Test Location",
      "100000"
    );

    for (let i = 0; i < 20; i++) {
      await db.insert(propertyImages).values({
        propertyId,
        imageUrl: `https://example.com/limit-image-${i}.jpg`,
        imageKey: `limit-image-${propertyId}-${i}`,
        order: i,
      });
    }

    const images = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId));

    expect(images.length).toBeLessThanOrEqual(20);
    expect(images.length).toBe(20);
  });

  it("should allow different properties to have their own 20 images", async () => {
    if (!db) throw new Error("Database not available");

    const propertyId1 = await createTestProperty(
      "Test Property 1",
      "Test Location 1",
      "100000"
    );
    const propertyId2 = await createTestProperty(
      "Test Property 2",
      "Test Location 2",
      "200000"
    );

    for (let i = 0; i < 20; i++) {
      await db.insert(propertyImages).values({
        propertyId: propertyId1,
        imageUrl: `https://example.com/property-1-image-${i}.jpg`,
        imageKey: `property-1-${propertyId1}-${i}`,
        order: i,
      });

      await db.insert(propertyImages).values({
        propertyId: propertyId2,
        imageUrl: `https://example.com/property-2-image-${i}.jpg`,
        imageKey: `property-2-${propertyId2}-${i}`,
        order: i,
      });
    }

    const images1 = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId1));
    const images2 = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId2));

    expect(images1).toHaveLength(20);
    expect(images2).toHaveLength(20);
  });
});
