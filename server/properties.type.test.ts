import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Test suite for property type validation and filtering
 */

const propertyTypeSchema = z.enum(["Apartamentos", "Casas", "Comerciais", "Galpões", "Rurais", "Terrenos"]);

const createPropertySchema = z.object({
  title: z.string().min(1, "Título eh obrigatorio"),
  location: z.string().min(1, "Localização eh obrigatoria"),
  price: z.string().min(1, "Preço eh obrigatorio"),
  type: propertyTypeSchema.default("Casas"),
  description: z.string().optional(),
  beds: z.number().min(0),
  baths: z.number().min(0),
  area: z.number().min(1),
  featured: z.boolean().default(false),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
describe("Property Type Schema Validation", () => {
  it("should accept valid property types", () => {
    const validTypes = ["Apartamentos", "Casas", "Comerciais", "Galpões", "Rurais", "Terrenos"];
    validTypes.forEach((type) => {
      const result = propertyTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    });
  });

  it("should reject invalid property types", () => {
    const invalidTypes = ["Loja", "Escritório", "Garagem", "", "loja", "CASAS"];
    invalidTypes.forEach((type) => {
      const result = propertyTypeSchema.safeParse(type);
      expect(result.success).toBe(false);
    });
  });

  it("should validate create property input with valid type", () => {
    const validInput = {
      title: "Casa Bonita",
      location: "São Paulo",
      price: "R$ 500.000",
      type: "Casas",
      beds: 3,
      baths: 2,
      area: 200,
    };
    const result = createPropertySchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("Casas");
    }
  });

  it("should reject create property input with invalid type", () => {
    const invalidInput = {
      title: "Casa Bonita",
      location: "São Paulo",
      price: "R$ 500.000",
      type: "Loja",
      beds: 3,
      baths: 2,
      area: 200,
    };
    const result = createPropertySchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("should use default type when not provided", () => {
    const inputWithoutType = {
      title: "Casa Bonita",
      location: "São Paulo",
      price: "R$ 500.000",
      beds: 3,
      baths: 2,
      area: 200,
    };
    const result = createPropertySchema.safeParse(inputWithoutType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("Casas");
    }
  });

  it("should validate terreno with zero beds and baths", () => {
    const terrenoInput = {
      title: "Terreno para Construção",
      location: "Bady Bassitt",
      price: "R$ 150.000",
      type: "Terrenos",
      beds: 0,
      baths: 0,
      area: 500,
    };
    const result = createPropertySchema.safeParse(terrenoInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.beds).toBe(0);
      expect(result.data.baths).toBe(0);
    }
  });
});

describe("Property Type Filtering and Extraction", () => {
  const mockProperties = [
    { id: 1, title: "Apt 1", type: "Apartamentos", beds: 2, baths: 1 },
    { id: 2, title: "Casa 1", type: "Casas", beds: 3, baths: 2 },
    { id: 3, title: "Loja 1", type: "Comerciais", beds: 0, baths: 1 },
    { id: 4, title: "Galpão 1", type: "Galpões", beds: 0, baths: 0 },
    { id: 5, title: "Terreno 1", type: "Terrenos", beds: 0, baths: 0 },
    { id: 6, title: "Apt 2", type: "Apartamentos", beds: 1, baths: 1 },
  ];

  it("should filter properties by type correctly", () => {
    const apartamentos = mockProperties.filter((p) => p.type === "Apartamentos");
    expect(apartamentos).toHaveLength(2);
    expect(apartamentos.every((p) => p.type === "Apartamentos")).toBe(true);
  });

  it("should return empty array for non-existent type", () => {
    const filtered = mockProperties.filter((p) => p.type === "Piscina");
    expect(filtered).toHaveLength(0);
  });

  it("should extract unique types from properties", () => {
    const types = Array.from(new Set(mockProperties.map((p) => p.type)));
    expect(types).toHaveLength(5);
    expect(types).toContain("Apartamentos");
    expect(types).toContain("Casas");
  });

  it("should handle properties without type field", () => {
    const propsWithoutType = [
      { id: 1, title: "Apt 1", beds: 2, baths: 1 },
      { id: 2, title: "Casa 1", type: "Casas", beds: 3, baths: 2 },
    ];
    const types = Array.from(new Set(propsWithoutType.map((p: any) => p.type).filter(Boolean)));
    expect(types).toHaveLength(1);
    expect(types[0]).toBe("Casas");
  });
});

describe("Dynamic Filter Options", () => {
  const mockProperties = [
    { id: 1, title: "Apt 1", type: "Apartamentos", beds: 2, baths: 1 },
    { id: 2, title: "Casa 1", type: "Casas", beds: 3, baths: 2 },
    { id: 3, title: "Terreno 1", type: "Terrenos", beds: 0, baths: 0 },
    { id: 4, title: "Casa 2", type: "Casas", beds: 4, baths: 3 },
  ];

  it("should generate available bed options from properties", () => {
    const bedOptions = Array.from(new Set(mockProperties.map((p) => p.beds).filter((b) => b > 0))).sort(
      (a, b) => a - b
    );
    expect(bedOptions).toEqual([2, 3, 4]);
    expect(bedOptions).not.toContain(0);
  });

  it("should generate available bath options from properties", () => {
    const bathOptions = Array.from(new Set(mockProperties.map((p) => p.baths).filter((b) => b > 0))).sort(
      (a, b) => a - b
    );
    expect(bathOptions).toEqual([1, 2, 3]);
    expect(bathOptions).not.toContain(0);
  });

  it("should not show zero-bed/bath options for terrenos", () => {
    const terrenos = mockProperties.filter((p) => p.type === "Terrenos");
    expect(terrenos.every((p) => p.beds === 0 && p.baths === 0)).toBe(true);
  });
});

describe("Type and Bedroom/Bathroom Filtering Combined", () => {
  const mockProperties = [
    { id: 1, title: "Apt 1", type: "Apartamentos", beds: 2, baths: 1 },
    { id: 2, title: "Casa 1", type: "Casas", beds: 3, baths: 2 },
    { id: 3, title: "Loja 1", type: "Comerciais", beds: 0, baths: 1 },
    { id: 4, title: "Terreno 1", type: "Terrenos", beds: 0, baths: 0 },
    { id: 5, title: "Casa 2", type: "Casas", beds: 4, baths: 3 },
  ];

  it("should filter by type and minimum beds", () => {
    const filtered = mockProperties.filter((p) => p.type === "Casas" && p.beds >= 3);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((p) => p.type === "Casas" && p.beds >= 3)).toBe(true);
  });

  it("should filter by type and minimum baths", () => {
    const filtered = mockProperties.filter((p) => p.type === "Apartamentos" && p.baths >= 1);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Apt 1");
  });

  it("should return empty when filtering terrenos by beds", () => {
    const filtered = mockProperties.filter((p) => p.type === "Terrenos" && p.beds >= 1);
    expect(filtered).toHaveLength(0);
  });
});
