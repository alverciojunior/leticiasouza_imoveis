import { describe, it, expect, beforeAll } from "vitest";
import { addWatermark } from "./watermark";
import sharp from "sharp";
import fs from "fs";

describe("Image upload integration with watermark", () => {
  let testImageBuffer: Buffer;
  let base64ImageData: string;
  const logoPath = "/home/ubuntu/webdev-static-assets/leticia-souza-logo.jpg";

  beforeAll(async () => {
    // Criar uma imagem de teste realista (640x480 pixels)
    testImageBuffer = await sharp({
      create: {
        width: 640,
        height: 480,
        channels: 3,
        background: { r: 100, g: 150, b: 200 },
      },
    })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Converter para base64 como seria feito no upload real
    base64ImageData = testImageBuffer.toString("base64");
  });

  it("should simulate complete upload flow with watermark", async () => {
    // Simular extração de base64 (como no uploadImage procedure)
    let extractedBase64 = base64ImageData;
    if (base64ImageData.includes(",")) {
      extractedBase64 = base64ImageData.split(",")[1];
    }

    expect(extractedBase64).toBeDefined();
    expect(extractedBase64.length).toBeGreaterThan(0);

    // Converter de volta para buffer
    const buffer = Buffer.from(extractedBase64, "base64");
    expect(buffer.length).toBeGreaterThan(0);

    // Aplicar marca d'água
    const watermarkedBuffer = await addWatermark(buffer, logoPath);
    expect(watermarkedBuffer).toBeDefined();
    expect(Buffer.isBuffer(watermarkedBuffer)).toBe(true);

    // Verificar que a imagem watermarked é válida
    const metadata = await sharp(watermarkedBuffer).metadata();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(640);
    expect(metadata.height).toBe(480);
  });

  it("should preserve image quality after watermark", async () => {
    // Aplicar marca d'água
    const watermarkedBuffer = await addWatermark(testImageBuffer, logoPath);

    // Verificar que a imagem tem tamanho razoável (não corrompida)
    expect(watermarkedBuffer.length).toBeGreaterThan(1000); // Pelo menos 1KB
    expect(watermarkedBuffer.length).toBeLessThan(testImageBuffer.length * 2); // Não deve ser muito maior

    // Verificar que é um JPEG válido
    const metadata = await sharp(watermarkedBuffer).metadata();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.hasAlpha).toBe(false); // JPEG não tem alpha
  });

  it("should handle filename sanitization and watermark together", async () => {
    // Simular nomes de arquivo com caracteres especiais
    const testFilenames = [
      "Casa com espaços.jpg",
      "Apartamento-São Paulo.jpg",
      "Imóvel_Comercial_2024.jpg",
      "Casa@Bady Bassitt.jpg",
    ];

    for (const filename of testFilenames) {
      // Sanitizar nome (como no uploadImage procedure)
      const sanitizedFileName = filename
        .replace(/\s+/g, "-") // Substituir espaços por hífens
        .replace(/[^a-zA-Z0-9._-]/g, "") // Remover caracteres especiais
        .toLowerCase();

      expect(sanitizedFileName).toBeDefined();
      expect(sanitizedFileName.length).toBeGreaterThan(0);
      expect(sanitizedFileName).not.toContain("@");
      expect(sanitizedFileName).not.toContain(" ");

      // Aplicar marca d'água (não deve falhar por causa do nome)
      const watermarkedBuffer = await addWatermark(testImageBuffer, logoPath);
      expect(Buffer.isBuffer(watermarkedBuffer)).toBe(true);
    }
  });

  it("should fail gracefully when logo is missing during upload", async () => {
    const nonExistentLogoPath = "/path/to/nonexistent/logo.jpg";

    // Deve lançar erro se o logo não existir
    await expect(addWatermark(testImageBuffer, nonExistentLogoPath)).rejects.toThrow();
  });

  it("should handle multiple sequential watermarks", async () => {
    // Simular múltiplos uploads sequenciais
    const watermarked1 = await addWatermark(testImageBuffer, logoPath);
    const watermarked2 = await addWatermark(testImageBuffer, logoPath);
    const watermarked3 = await addWatermark(testImageBuffer, logoPath);

    // Todos devem ser válidos
    expect(Buffer.isBuffer(watermarked1)).toBe(true);
    expect(Buffer.isBuffer(watermarked2)).toBe(true);
    expect(Buffer.isBuffer(watermarked3)).toBe(true);

    // Todos devem ter metadados válidos
    const meta1 = await sharp(watermarked1).metadata();
    const meta2 = await sharp(watermarked2).metadata();
    const meta3 = await sharp(watermarked3).metadata();

    expect(meta1.format).toBe("jpeg");
    expect(meta2.format).toBe("jpeg");
    expect(meta3.format).toBe("jpeg");
  });
});
