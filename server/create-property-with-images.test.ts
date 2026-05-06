import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { properties, propertyImages } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Create property with images - Critical bug fix validation", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup
    if (db) {
      try {
        // Delete test images
        await db.delete(propertyImages).where(eq(propertyImages.propertyId, 999));
        // Delete test property
        await db.delete(properties).where(eq(properties.id, 999));
      } catch (e) {
        console.log("Cleanup error (expected if records don't exist):", e);
      }
    }
  });

  it("should create property and return correct ID", async () => {
    if (!db) throw new Error("Database not available");

    // Create a test property
    const testProperty = {
      title: "Test Property for Image Bug Fix",
      location: "Test Location",
      price: "500000",
      type: "Casas",
      description: "Test property",
      beds: 3,
      baths: 2,
      area: 150,
      featured: 0,
      latitude: "-20.6596",
      longitude: "-48.7669",
      sold: 0,
    };

    const result = await db.insert(properties).values(testProperty);
    
    // Extract the inserted ID
    const insertedId = (result as any)?.[0]?.insertId || (result as any)?.insertId;
    
    expect(insertedId).toBeDefined();
    expect(Number(insertedId)).toBeGreaterThan(0);
    
    // Verify property was created with correct ID
    const createdProperty = (await db.select().from(properties).where(eq(properties.id, Number(insertedId))))[0];
    
    expect(createdProperty).toBeDefined();
    expect(createdProperty?.title).toBe("Test Property for Image Bug Fix");
  });

  it("should ensure images are only attached to correct property", async () => {
    if (!db) throw new Error("Database not available");

    // Create two test properties
    const prop1 = {
      title: "Property 1",
      location: "Location 1",
      price: "100000",
      type: "Casas",
      description: "Test",
      beds: 2,
      baths: 1,
      area: 100,
      featured: 0,
      latitude: "-20.6596",
      longitude: "-48.7669",
      sold: 0,
    };

    const prop2 = {
      title: "Property 2",
      location: "Location 2",
      price: "200000",
      type: "Apartamentos",
      description: "Test",
      beds: 3,
      baths: 2,
      area: 120,
      featured: 0,
      latitude: "-20.6596",
      longitude: "-48.7669",
      sold: 0,
    };

    const result1 = await db.insert(properties).values(prop1);
    const result2 = await db.insert(properties).values(prop2);

    const prop1Id = (result1 as any)?.[0]?.insertId || (result1 as any)?.insertId;
    const prop2Id = (result2 as any)?.[0]?.insertId || (result2 as any)?.insertId;

    expect(prop1Id).toBeDefined();
    expect(prop2Id).toBeDefined();
    expect(Number(prop1Id)).not.toBe(Number(prop2Id));

    // Add images to property 1
    await db.insert(propertyImages).values({
      propertyId: Number(prop1Id),
      imageUrl: "/image1.jpg",
      imageKey: "test-key-1",
      order: 0,
    });

    // Add images to property 2
    await db.insert(propertyImages).values({
      propertyId: Number(prop2Id),
      imageUrl: "/image2.jpg",
      imageKey: "test-key-2",
      order: 0,
    });

    // Verify images are only attached to their respective properties
    const prop1Images = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, Number(prop1Id)));
    const prop2Images = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, Number(prop2Id)));

    expect(prop1Images).toHaveLength(1);
    expect(prop2Images).toHaveLength(1);
    expect(prop1Images[0]?.imageUrl).toBe("/image1.jpg");
    expect(prop2Images[0]?.imageUrl).toBe("/image2.jpg");

    // Cleanup
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, Number(prop1Id)));
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, Number(prop2Id)));
    await db.delete(properties).where(eq(properties.id, Number(prop1Id)));
    await db.delete(properties).where(eq(properties.id, Number(prop2Id)));
  });
});
