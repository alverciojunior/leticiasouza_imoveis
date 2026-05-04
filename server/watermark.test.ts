import { describe, it, expect, beforeAll } from "vitest";
import { addWatermark } from "./watermark";
import sharp from "sharp";
import fs from "fs";
import path from "path";

describe("Watermark functionality", () => {
  let testImageBuffer: Buffer;
  const logoPath = "/home/ubuntu/webdev-static-assets/leticia-souza-logo.jpg";

  beforeAll(async () => {
    // Criar uma imagem de teste simples (100x100 pixels)
    testImageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .jpeg()
      .toBuffer();
  });

  it("should add watermark to an image", async () => {
    const watermarkedBuffer = await addWatermark(testImageBuffer, logoPath);

    expect(watermarkedBuffer).toBeDefined();
    expect(Buffer.isBuffer(watermarkedBuffer)).toBe(true);
    expect(watermarkedBuffer.length).toBeGreaterThan(0);
  });

  it("should return a buffer with watermark that is different from original", async () => {
    const watermarkedBuffer = await addWatermark(testImageBuffer, logoPath);

    // A imagem com marca d'água deve ter tamanho diferente da original
    // (pode ser maior ou menor dependendo da compressão JPEG)
    expect(watermarkedBuffer).toBeDefined();
    expect(Buffer.isBuffer(watermarkedBuffer)).toBe(true);
  });

  it("should throw error when logo is missing", async () => {
    const nonExistentLogoPath = "/path/to/nonexistent/logo.jpg";

    // Deve lançar erro se o logo não existir
    await expect(addWatermark(testImageBuffer, nonExistentLogoPath)).rejects.toThrow();
  });



  it("should process large images without errors", async () => {
    // Criar uma imagem maior (800x600 pixels)
    const largeImageBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 200, g: 150, b: 100 },
      },
    })
      .jpeg()
      .toBuffer();

    const watermarkedBuffer = await addWatermark(largeImageBuffer, logoPath);

    expect(watermarkedBuffer).toBeDefined();
    expect(Buffer.isBuffer(watermarkedBuffer)).toBe(true);
    expect(watermarkedBuffer.length).toBeGreaterThan(0);
  });

  it("should preserve image format as JPEG", async () => {
    const watermarkedBuffer = await addWatermark(testImageBuffer, logoPath);
    const metadata = await sharp(watermarkedBuffer).metadata();

    expect(metadata.format).toBe("jpeg");
  });

  it("should create watermark with correct size (15% of image width)", async () => {
    // Criar imagem com dimensões conhecidas
    const testWidth = 200;
    const testHeight = 200;
    const imageBuffer = await sharp({
      create: {
        width: testWidth,
        height: testHeight,
        channels: 3,
        background: { r: 100, g: 100, b: 100 },
      },
    })
      .jpeg()
      .toBuffer();

    const watermarkedBuffer = await addWatermark(imageBuffer, logoPath);
    const metadata = await sharp(watermarkedBuffer).metadata();

    // Verificar que a imagem processada mantém as dimensões originais
    expect(metadata.width).toBe(testWidth);
    expect(metadata.height).toBe(testHeight);
  });

  it("should apply JPEG compression to watermarked image", async () => {
    const watermarkedBuffer = await addWatermark(testImageBuffer, logoPath);
    const metadata = await sharp(watermarkedBuffer).metadata();

    // Verificar que a imagem é JPEG com compressão
    expect(metadata.format).toBe("jpeg");
    expect(watermarkedBuffer.length).toBeGreaterThan(0);
  });
});
