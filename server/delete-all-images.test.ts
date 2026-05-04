import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { deleteAllPropertyImages, addPropertyImage, getPropertyImages, createProperty } from "./db";

describe("Delete all images functionality", () => {
  let testPropertyId: number;

  beforeAll(async () => {
    // Criar uma propriedade de teste
    const result = await createProperty({
      title: "Test Property for Delete All",
      location: "Test Location",
      price: "100000",
      beds: 3,
      baths: 2,
      area: 150,
      featured: 0,
      description: "Test property",
      type: "Apartamentos",
    });
    
    if (Array.isArray(result)) {
      testPropertyId = result[0]?.insertId || 1;
    } else {
      testPropertyId = 1;
    }

    // Adicionar algumas imagens de teste
    for (let i = 0; i < 3; i++) {
      await addPropertyImage({
        propertyId: testPropertyId,
        imageUrl: `https://example.com/image${i}.jpg`,
        imageKey: `test-key-${i}`,
        order: i,
      });
    }
  });

  it("should delete all images for a property", async () => {
    // Verificar que existem imagens antes da exclusão
    const imagesBefore = await getPropertyImages(testPropertyId);
    expect(imagesBefore.length).toBeGreaterThan(0);

    // Deletar todas as imagens
    await deleteAllPropertyImages(testPropertyId);

    // Verificar que não há mais imagens
    const imagesAfter = await getPropertyImages(testPropertyId);
    expect(imagesAfter.length).toBe(0);
  });

  it("should handle deletion when no images exist", async () => {
    // Criar uma nova propriedade sem imagens
    const result = await createProperty({
      title: "Test Property No Images",
      location: "Test Location",
      price: "100000",
      beds: 3,
      baths: 2,
      area: 150,
      featured: 0,
      description: "Test property",
      type: "Apartamentos",
    });

    let propertyId = 1;
    if (Array.isArray(result)) {
      propertyId = result[0]?.insertId || 1;
    }

    // Tentar deletar imagens (não deve falhar mesmo sem imagens)
    await expect(deleteAllPropertyImages(propertyId)).resolves.not.toThrow();

    // Verificar que não há imagens
    const images = await getPropertyImages(propertyId);
    expect(images.length).toBe(0);
  });

  it("should only delete images from the specified property", async () => {
    // Criar duas propriedades
    const result1 = await createProperty({
      title: "Property 1",
      location: "Location 1",
      price: "100000",
      beds: 3,
      baths: 2,
      area: 150,
      featured: 0,
      description: "Property 1",
      type: "Apartamentos",
    });

    const result2 = await createProperty({
      title: "Property 2",
      location: "Location 2",
      price: "200000",
      beds: 4,
      baths: 3,
      area: 200,
      featured: 0,
      description: "Property 2",
      type: "Casas",
    });

    let propertyId1 = 1;
    let propertyId2 = 2;

    if (Array.isArray(result1)) {
      propertyId1 = result1[0]?.insertId || 1;
    }
    if (Array.isArray(result2)) {
      propertyId2 = result2[0]?.insertId || 2;
    }

    // Adicionar imagens para ambas as propriedades
    await addPropertyImage({
      propertyId: propertyId1,
      imageUrl: "https://example.com/prop1-img1.jpg",
      imageKey: "prop1-key-1",
      order: 0,
    });

    await addPropertyImage({
      propertyId: propertyId2,
      imageUrl: "https://example.com/prop2-img1.jpg",
      imageKey: "prop2-key-1",
      order: 0,
    });

    // Deletar imagens apenas da propriedade 1
    await deleteAllPropertyImages(propertyId1);

    // Verificar que propriedade 1 não tem imagens
    const images1 = await getPropertyImages(propertyId1);
    expect(images1.length).toBe(0);

    // Verificar que propriedade 2 ainda tem imagens
    const images2 = await getPropertyImages(propertyId2);
    expect(images2.length).toBeGreaterThan(0);
  });
});
