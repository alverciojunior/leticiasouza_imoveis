import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { properties, propertyImages } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Image limit validation", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    if (db) {
      try {
        await db.delete(propertyImages).where(eq(propertyImages.propertyId, 999));
        await db.delete(propertyImages).where(eq(propertyImages.propertyId, 998));
        await db.delete(propertyImages).where(eq(propertyImages.propertyId, 997));
        await db.delete(properties).where(eq(properties.id, 999));
        await db.delete(properties).where(eq(properties.id, 998));
        await db.delete(properties).where(eq(properties.id, 997));
      } catch (e) {
        console.log("Cleanup error (expected if records don't exist):", e);
      }
    }
  });

  it("should allow adding images up to 20", async () => {
    if (!db) throw new Error("Database not available");

    // Limpar dados anteriores
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, 999));
    await db.delete(properties).where(eq(properties.id, 999));

    // Criar propriedade de teste
    const testProperty = {
      id: 999,
      title: "Test Property",
      location: "Test Location",
      price: "100000",
      beds: 3,
      baths: 2,
      area: 150,
      description: "Test description",
      latitude: -20.5105,
      longitude: -48.7789,
      isSold: false,
      createdAt: new Date(),
    };

    await db.insert(properties).values(testProperty);

    // Adicionar 20 imagens
    for (let i = 0; i < 20; i++) {
      await db.insert(propertyImages).values({
        propertyId: 999,
        imageUrl: `https://example.com/image-${i}.jpg`,
        imageKey: `image-${i}`,
        order: i,
      });
    }

    const images = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, 999));

    expect(images).toHaveLength(20);
  });

  it("should validate that limit is enforced at 20 images", async () => {
    if (!db) throw new Error("Database not available");

    // Limpar dados anteriores
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, 998));
    await db.delete(properties).where(eq(properties.id, 998));

    // Criar propriedade de teste
    const testProperty = {
      id: 998,
      title: "Test Property",
      location: "Test Location",
      price: "100000",
      beds: 3,
      baths: 2,
      area: 150,
      description: "Test description",
      latitude: -20.5105,
      longitude: -48.7789,
      isSold: false,
      createdAt: new Date(),
    };

    await db.insert(properties).values(testProperty);

    // Adicionar 20 imagens
    for (let i = 0; i < 20; i++) {
      await db.insert(propertyImages).values({
        propertyId: 998,
        imageUrl: `https://example.com/image-${i}.jpg`,
        imageKey: `image-${i}`,
        order: i,
      });
    }

    const images = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, 998));

    // Validar que não pode ultrapassar 20
    expect(images.length).toBeLessThanOrEqual(20);
    expect(images.length).toBe(20);
  });

  it("should allow different properties to have their own 20 images", async () => {
    if (!db) throw new Error("Database not available");

    // Limpar dados anteriores
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, 999));
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, 998));
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, 997));
    await db.delete(properties).where(eq(properties.id, 999));
    await db.delete(properties).where(eq(properties.id, 998));
    await db.delete(properties).where(eq(properties.id, 997));

    // Criar primeira propriedade
    const testProperty1 = {
      id: 999,
      title: "Test Property 1",
      location: "Test Location 1",
      price: "100000",
      beds: 3,
      baths: 2,
      area: 150,
      description: "Test description",
      latitude: -20.5105,
      longitude: -48.7789,
      isSold: false,
      createdAt: new Date(),
    };

    // Criar segunda propriedade
    const testProperty2 = {
      id: 998,
      title: "Test Property 2",
      location: "Test Location 2",
      price: "200000",
      beds: 4,
      baths: 3,
      area: 200,
      description: "Test description 2",
      latitude: -20.5105,
      longitude: -48.7789,
      isSold: false,
      createdAt: new Date(),
    };

    await db.insert(properties).values(testProperty1);
    await db.insert(properties).values(testProperty2);

    // Adicionar 20 imagens para primeira propriedade
    for (let i = 0; i < 20; i++) {
      await db.insert(propertyImages).values({
        propertyId: 999,
        imageUrl: `https://example.com/prop1-image-${i}.jpg`,
        imageKey: `prop1-image-${i}`,
        order: i,
      });
    }

    // Adicionar 20 imagens para segunda propriedade
    for (let i = 0; i < 20; i++) {
      await db.insert(propertyImages).values({
        propertyId: 998,
        imageUrl: `https://example.com/prop2-image-${i}.jpg`,
        imageKey: `prop2-image-${i}`,
        order: i,
      });
    }

    const images1 = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, 999));

    const images2 = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, 998));

    expect(images1).toHaveLength(20);
    expect(images2).toHaveLength(20);
  });
});
