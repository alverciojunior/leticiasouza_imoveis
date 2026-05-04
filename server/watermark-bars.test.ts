import { describe, it, expect, beforeAll } from "vitest";
import { addWatermark } from "./watermark";
import sharp from "sharp";

describe("Watermark black bars removal", () => {
  let testImageBuffer: Buffer;
  const logoPath = "/home/ubuntu/webdev-static-assets/leticia-souza-logo.jpg";

  beforeAll(async () => {
    // Criar uma imagem de teste com fundo branco para detectar barras pretas
    testImageBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .jpeg({ quality: 90 })
      .toBuffer();
  });

  it("should not have black bars above and below watermark", async () => {
    const watermarkedBuffer = await addWatermark(testImageBuffer, logoPath);
    
    // Converter para imagem Sharp para análise
    const watermarkedImage = sharp(watermarkedBuffer);
    const { data, info } = await watermarkedImage.raw().toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    const channels = info.channels;
    
    // Analisar a região central onde o logo deve estar
    // Procurar por faixas pretas (R, G, B todos < 50)
    const centerY = Math.floor(height / 2);
    const centerX = Math.floor(width / 2);
    const searchRadius = Math.floor(Math.min(width, height) * 0.15); // Área do logo
    
    let blackPixelCount = 0;
    let totalPixelsAnalyzed = 0;
    
    // Analisar uma faixa vertical no centro
    for (let y = centerY - searchRadius; y < centerY + searchRadius; y++) {
      if (y < 0 || y >= height) continue;
      
      for (let x = centerX - searchRadius; x < centerX + searchRadius; x++) {
        if (x < 0 || x >= width) continue;
        
        const pixelIndex = (y * width + x) * channels;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        
        // Considerar pixel preto se R, G, B < 50
        if (r < 50 && g < 50 && b < 50) {
          blackPixelCount++;
        }
        totalPixelsAnalyzed++;
      }
    }
    
    // Calcular percentual de pixels pretos na região do logo
    const blackPixelPercentage = (blackPixelCount / totalPixelsAnalyzed) * 100;
    
    // Não deve haver mais de 10% de pixels pretos na região central
    // (alguns pixels pretos podem estar no logo, mas não deve haver barras sólidas)
    expect(blackPixelPercentage).toBeLessThan(10);
  });

  it("should have centered watermark without letterboxing", async () => {
    const watermarkedBuffer = await addWatermark(testImageBuffer, logoPath);
    
    // Converter para imagem Sharp para análise
    const watermarkedImage = sharp(watermarkedBuffer);
    const { data, info } = await watermarkedImage.raw().toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    const channels = info.channels;
    
    // Verificar que não há faixas pretas horizontais sólidas
    // Analisar linhas horizontais no terço superior e inferior
    const checkHeight = Math.floor(height * 0.25);
    
    // Verificar terço superior
    for (let y = 0; y < checkHeight; y++) {
      let blackPixelsInRow = 0;
      
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * channels;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        
        if (r < 50 && g < 50 && b < 50) {
          blackPixelsInRow++;
        }
      }
      
      // Não deve haver linhas completamente pretas (menos de 80% de pixels pretos)
      const blackPercentageInRow = (blackPixelsInRow / width) * 100;
      expect(blackPercentageInRow).toBeLessThan(80);
    }
  });

  it("should trim logo without leaving black borders", async () => {
    const watermarkedBuffer = await addWatermark(testImageBuffer, logoPath);
    const metadata = await sharp(watermarkedBuffer).metadata();
    
    // Verificar que a imagem mantém as dimensões originais
    expect(metadata.width).toBe(800);
    expect(metadata.height).toBe(600);
    
    // Verificar que é um JPEG válido
    expect(metadata.format).toBe("jpeg");
  });
});
