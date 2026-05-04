import { describe, it, expect } from "vitest";

/**
 * Test suite for property sorting functionality
 */

const mockProperties = [
  { id: 1, title: "Casa 1", price: "R$ 500.000", beds: 3, baths: 2 },
  { id: 2, title: "Casa 2", price: "R$ 300.000", beds: 2, baths: 1 },
  { id: 3, title: "Casa 3", price: "R$ 800.000", beds: 4, baths: 3 },
  { id: 4, title: "Casa 4", price: "R$ 150.000", beds: 1, baths: 1 },
  { id: 5, title: "Casa 5", price: "R$ 1.200.000", beds: 5, baths: 4 },
];

describe("Property Sorting", () => {
  it("should extract price from formatted string", () => {
    const price = "R$ 500.000";
    const extracted = parseInt(price.replace(/[^0-9]/g, ""));
    expect(extracted).toBe(500000);
  });

  it("should sort properties by price ascending (menor preço)", () => {
    const sorted = [...mockProperties].sort((a, b) => {
      const priceA = parseInt(a.price.replace(/[^0-9]/g, ""));
      const priceB = parseInt(b.price.replace(/[^0-9]/g, ""));
      return priceA - priceB;
    });

    expect(sorted[0].title).toBe("Casa 4"); // R$ 150.000
    expect(sorted[1].title).toBe("Casa 2"); // R$ 300.000
    expect(sorted[2].title).toBe("Casa 1"); // R$ 500.000
    expect(sorted[3].title).toBe("Casa 3"); // R$ 800.000
    expect(sorted[4].title).toBe("Casa 5"); // R$ 1.200.000
  });

  it("should sort properties by price descending (maior preço)", () => {
    const sorted = [...mockProperties].sort((a, b) => {
      const priceA = parseInt(a.price.replace(/[^0-9]/g, ""));
      const priceB = parseInt(b.price.replace(/[^0-9]/g, ""));
      return priceB - priceA;
    });

    expect(sorted[0].title).toBe("Casa 5"); // R$ 1.200.000
    expect(sorted[1].title).toBe("Casa 3"); // R$ 800.000
    expect(sorted[2].title).toBe("Casa 1"); // R$ 500.000
    expect(sorted[3].title).toBe("Casa 2"); // R$ 300.000
    expect(sorted[4].title).toBe("Casa 4"); // R$ 150.000
  });

  it("should sort properties by id descending (mais recentes)", () => {
    const sorted = [...mockProperties].sort((a, b) => b.id - a.id);

    expect(sorted[0].id).toBe(5);
    expect(sorted[1].id).toBe(4);
    expect(sorted[2].id).toBe(3);
    expect(sorted[3].id).toBe(2);
    expect(sorted[4].id).toBe(1);
  });

  it("should handle sorting with filter and sort combined", () => {
    const filtered = mockProperties.filter((p) => p.beds >= 2);
    const sorted = filtered.sort((a, b) => {
      const priceA = parseInt(a.price.replace(/[^0-9]/g, ""));
      const priceB = parseInt(b.price.replace(/[^0-9]/g, ""));
      return priceA - priceB;
    });

    expect(sorted).toHaveLength(4);
    expect(sorted[0].title).toBe("Casa 2"); // R$ 300.000, 2 beds
    expect(sorted[1].title).toBe("Casa 1"); // R$ 500.000, 3 beds
    expect(sorted[2].title).toBe("Casa 3"); // R$ 800.000, 4 beds
    expect(sorted[3].title).toBe("Casa 5"); // R$ 1.200.000, 5 beds
  });

  it("should maintain stable sort order for equal prices", () => {
    const propsWithSamePrice = [
      { id: 1, title: "Casa A", price: "R$ 500.000", beds: 3, baths: 2 },
      { id: 2, title: "Casa B", price: "R$ 500.000", beds: 3, baths: 2 },
      { id: 3, title: "Casa C", price: "R$ 500.000", beds: 3, baths: 2 },
    ];

    const sorted = [...propsWithSamePrice].sort((a, b) => {
      const priceA = parseInt(a.price.replace(/[^0-9]/g, ""));
      const priceB = parseInt(b.price.replace(/[^0-9]/g, ""));
      if (priceA !== priceB) return priceA - priceB;
      return b.id - a.id; // Fallback to most recent
    });

    expect(sorted[0].id).toBe(3);
    expect(sorted[1].id).toBe(2);
    expect(sorted[2].id).toBe(1);
  });

  it("should handle empty properties array", () => {
    const sorted = [].sort((a, b) => {
      const priceA = parseInt(a.price.replace(/[^0-9]/g, ""));
      const priceB = parseInt(b.price.replace(/[^0-9]/g, ""));
      return priceA - priceB;
    });

    expect(sorted).toHaveLength(0);
  });

  it("should handle single property", () => {
    const sorted = [mockProperties[0]].sort((a, b) => {
      const priceA = parseInt(a.price.replace(/[^0-9]/g, ""));
      const priceB = parseInt(b.price.replace(/[^0-9]/g, ""));
      return priceA - priceB;
    });

    expect(sorted).toHaveLength(1);
    expect(sorted[0].title).toBe("Casa 1");
  });
});

describe("Sort Options", () => {
  it("should have valid sort options", () => {
    const validSortOptions = ["recente", "preco-asc", "preco-desc"];
    expect(validSortOptions).toContain("recente");
    expect(validSortOptions).toContain("preco-asc");
    expect(validSortOptions).toContain("preco-desc");
  });

  it("should apply correct sort based on sortBy parameter", () => {
    const sortBy = "preco-asc";
    const sorted = [...mockProperties].sort((a, b) => {
      const priceA = parseInt(a.price.replace(/[^0-9]/g, ""));
      const priceB = parseInt(b.price.replace(/[^0-9]/g, ""));

      if (sortBy === "preco-asc") {
        return priceA - priceB;
      } else if (sortBy === "preco-desc") {
        return priceB - priceA;
      }
      return b.id - a.id;
    });

    expect(sorted[0].price).toBe("R$ 150.000");
    expect(sorted[sorted.length - 1].price).toBe("R$ 1.200.000");
  });

  it("should apply default sort (recente) when sortBy is recente", () => {
    const sortBy = "recente";
    const sorted = [...mockProperties].sort((a, b) => {
      const priceA = parseInt(a.price.replace(/[^0-9]/g, ""));
      const priceB = parseInt(b.price.replace(/[^0-9]/g, ""));

      if (sortBy === "preco-asc") {
        return priceA - priceB;
      } else if (sortBy === "preco-desc") {
        return priceB - priceA;
      }
      return b.id - a.id;
    });

    expect(sorted[0].id).toBe(5);
    expect(sorted[sorted.length - 1].id).toBe(1);
  });
});
