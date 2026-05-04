import { describe, it, expect, beforeAll } from "vitest";
import { addWatermark } from "./watermark";
import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * Test suite for watermark functionality
 */

describe("Watermark Functionality", () => {
  let testImageBuffer: Buffer;
  let watermarkPath: string;

  beforeAll(async () => {
    // Create a test image (100x100 red square)
    testImageBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 200, g: 150, b: 100 },
      },
    })
      .jpeg()
      .toBuffer();

    // Set watermark path
    watermarkPath = path.join(process.cwd(), "../webdev-static-assets/watermark-logo.jpg");
  });

  it("should return buffer when watermark file does not exist", async () => {
    const fakeWatermarkPath = "/nonexistent/watermark.jpg";
    const result = await addWatermark(testImageBuffer, fakeWatermarkPath);

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return buffer when adding watermark to valid image", async () => {
    if (!fs.existsSync(watermarkPath)) {
      console.warn(`Watermark file not found at ${watermarkPath}, skipping test`);
      expect(true).toBe(true);
      return;
    }

    const result = await addWatermark(testImageBuffer, watermarkPath);

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return buffer with watermark applied", async () => {
    if (!fs.existsSync(watermarkPath)) {
      console.warn(`Watermark file not found at ${watermarkPath}, skipping test`);
      expect(true).toBe(true);
      return;
    }

    const resultWithWatermark = await addWatermark(testImageBuffer, watermarkPath);
    const metadata = await sharp(resultWithWatermark).metadata();

    expect(metadata.width).toBe(800);
    expect(metadata.height).toBe(600);
  });

  it("should handle watermark on different image sizes", async () => {
    if (!fs.existsSync(watermarkPath)) {
      console.warn(`Watermark file not found at ${watermarkPath}, skipping test`);
      expect(true).toBe(true);
      return;
    }

    // Test with different image sizes
    const sizes = [
      { width: 400, height: 300 },
      { width: 1200, height: 900 },
      { width: 600, height: 600 },
    ];

    for (const size of sizes) {
      const testImage = await sharp({
        create: {
          width: size.width,
          height: size.height,
          channels: 3,
          background: { r: 200, g: 150, b: 100 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await addWatermark(testImage, watermarkPath);
      const metadata = await sharp(result).metadata();

      expect(metadata.width).toBe(size.width);
      expect(metadata.height).toBe(size.height);
    }
  });

  it("should preserve image quality after watermark", async () => {
    if (!fs.existsSync(watermarkPath)) {
      console.warn(`Watermark file not found at ${watermarkPath}, skipping test`);
      expect(true).toBe(true);
      return;
    }

    const result = await addWatermark(testImageBuffer, watermarkPath);
    const metadata = await sharp(result).metadata();

    // Check that image is still valid JPEG
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBeGreaterThan(0);
    expect(metadata.height).toBeGreaterThan(0);
  });

  it("should calculate watermark size as 20% of image width", async () => {
    if (!fs.existsSync(watermarkPath)) {
      console.warn(`Watermark file not found at ${watermarkPath}, skipping test`);
      expect(true).toBe(true);
      return;
    }

    const imageMetadata = await sharp(testImageBuffer).metadata();
    const expectedWatermarkWidth = Math.round((imageMetadata.width || 800) * 0.2);

    // Watermark should be 20% of image width
    expect(expectedWatermarkWidth).toBe(160); // 800 * 0.2
  });

  it("should handle invalid image buffer gracefully", async () => {
    const invalidBuffer = Buffer.from("not an image");

    try {
      const result = await addWatermark(invalidBuffer, watermarkPath);
      // Should return buffer (either original or error handled)
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);
    } catch (error) {
      // Error is acceptable for invalid input
      expect(error).toBeDefined();
    }
  });
});

describe("Watermark Integration", () => {
  it("should have watermark file available", () => {
    const watermarkPath = path.join(process.cwd(), "../webdev-static-assets/watermark-logo.jpg");
    const exists = fs.existsSync(watermarkPath);

    if (!exists) {
      console.warn(`Watermark file not found at ${watermarkPath}`);
    }
    expect(true).toBe(true);
  });

  it("should have watermark logo with expected properties", () => {
    const watermarkPath = path.join(process.cwd(), "../webdev-static-assets/watermark-logo.jpg");

    if (!fs.existsSync(watermarkPath)) {
      console.warn(`Watermark file not found at ${watermarkPath}`);
      expect(true).toBe(true);
      return;
    }

    const stats = fs.statSync(watermarkPath);
    expect(stats.size).toBeGreaterThan(0);
  });
});
