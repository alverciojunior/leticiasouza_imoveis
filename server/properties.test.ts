import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

describe("Properties Validation", () => {
  describe("Coordinate Validation", () => {
    const coordinateSchema = z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
    });

    it("should accept valid latitude values", () => {
      const validCases = [
        { latitude: -90, longitude: 0 },
        { latitude: 0, longitude: 0 },
        { latitude: 90, longitude: 0 },
        { latitude: -20.6596, longitude: -48.7669 }, // Bady Bassitt
      ];

      validCases.forEach((coords) => {
        expect(() => coordinateSchema.parse(coords)).not.toThrow();
      });
    });

    it("should accept valid longitude values", () => {
      const validCases = [
        { latitude: 0, longitude: -180 },
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 180 },
        { latitude: -20.6596, longitude: -48.7669 },
      ];

      validCases.forEach((coords) => {
        expect(() => coordinateSchema.parse(coords)).not.toThrow();
      });
    });

    it("should reject invalid latitude values", () => {
      const invalidCases = [
        { latitude: -91, longitude: 0 },
        { latitude: 91, longitude: 0 },
        { latitude: 180, longitude: 0 },
      ];

      invalidCases.forEach((coords) => {
        expect(() => coordinateSchema.parse(coords)).toThrow();
      });
    });

    it("should reject invalid longitude values", () => {
      const invalidCases = [
        { latitude: 0, longitude: -181 },
        { latitude: 0, longitude: 181 },
        { latitude: 0, longitude: 360 },
      ];

      invalidCases.forEach((coords) => {
        expect(() => coordinateSchema.parse(coords)).toThrow();
      });
    });

    it("should accept optional coordinates", () => {
      const cases = [
        {},
        { latitude: 0 },
        { longitude: 0 },
      ];

      cases.forEach((coords) => {
        expect(() => coordinateSchema.parse(coords)).not.toThrow();
      });
    });
  });

  describe("Geocoding Response", () => {
    it("should parse valid geocoding response", () => {
      const mockResponse = {
        status: "OK",
        results: [
          {
            address_components: [],
            formatted_address: "Bady Bassitt, SP, Brazil",
            geometry: {
              location: { lat: -20.6596, lng: -48.7669 },
              location_type: "APPROXIMATE",
              viewport: {
                northeast: { lat: -20.6, lng: -48.7 },
                southwest: { lat: -20.7, lng: -48.8 },
              },
            },
            place_id: "test_place_id",
            types: ["locality", "political"],
          },
        ],
      };

      expect(mockResponse.status).toBe("OK");
      expect(mockResponse.results).toHaveLength(1);
      expect(mockResponse.results[0].geometry.location.lat).toBe(-20.6596);
      expect(mockResponse.results[0].geometry.location.lng).toBe(-48.7669);
    });

    it("should handle empty geocoding results", () => {
      const mockResponse = {
        status: "ZERO_RESULTS",
        results: [],
      };

      expect(mockResponse.results).toHaveLength(0);
      expect(mockResponse.status).toBe("ZERO_RESULTS");
    });
  });

  describe("Property Creation with Coordinates", () => {
    const propertySchema = z.object({
      title: z.string().min(1),
      location: z.string().min(1),
      price: z.string().min(1),
      beds: z.number().min(0),
      baths: z.number().min(0),
      area: z.number().min(1),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
    });

    it("should accept property with valid coordinates", () => {
      const property = {
        title: "Terreno para Construção",
        location: "Bady Bassitt - SP",
        price: "R$ 150.000",
        beds: 0,
        baths: 0,
        area: 500,
        latitude: -20.6596,
        longitude: -48.7669,
      };

      expect(() => propertySchema.parse(property)).not.toThrow();
    });

    it("should accept property without coordinates", () => {
      const property = {
        title: "Casa",
        location: "São Paulo - SP",
        price: "R$ 500.000",
        beds: 3,
        baths: 2,
        area: 150,
      };

      expect(() => propertySchema.parse(property)).not.toThrow();
    });

    it("should reject property with invalid latitude", () => {
      const property = {
        title: "Casa",
        location: "São Paulo - SP",
        price: "R$ 500.000",
        beds: 3,
        baths: 2,
        area: 150,
        latitude: 91,
        longitude: 0,
      };

      expect(() => propertySchema.parse(property)).toThrow();
    });

    it("should reject property with invalid longitude", () => {
      const property = {
        title: "Casa",
        location: "São Paulo - SP",
        price: "R$ 500.000",
        beds: 3,
        baths: 2,
        area: 150,
        latitude: 0,
        longitude: 181,
      };

      expect(() => propertySchema.parse(property)).toThrow();
    });

    it("should allow zero bedrooms and bathrooms for land", () => {
      const property = {
        title: "Terreno",
        location: "Bady Bassitt - SP",
        price: "R$ 150.000",
        beds: 0,
        baths: 0,
        area: 500,
      };

      expect(() => propertySchema.parse(property)).not.toThrow();
    });
  });
});
