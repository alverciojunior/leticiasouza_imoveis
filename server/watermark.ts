import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * Add watermark to image
 * @param imageBuffer - Image buffer to add watermark to
 * @param watermarkPath - Path to watermark image
 * @returns Promise<Buffer> - Image buffer with watermark
 */
export async function addWatermark(imageBuffer: Buffer, watermarkPath: string): Promise<Buffer> {
  try {
    // Verify watermark file exists
    if (!fs.existsSync(watermarkPath)) {
      console.warn(`Watermark file not found at ${watermarkPath}, returning original image`);
      return imageBuffer;
    }

    // Get image metadata
    const imageMetadata = await sharp(imageBuffer).metadata();
    if (!imageMetadata.width || !imageMetadata.height) {
      console.warn("Could not get image dimensions, returning original image");
      return imageBuffer;
    }

    // Calculate watermark size (15% of image width)
    const watermarkWidth = Math.round(imageMetadata.width * 0.15);

    // Read and resize watermark with reduced opacity
    const watermarkBuffer = await sharp(watermarkPath)
      .resize(watermarkWidth, watermarkWidth, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();

    // Create semi-transparent overlay (30% opacity)
    const transparentWatermark = await sharp(watermarkBuffer)
      .composite([
        {
          input: Buffer.from(
            `<svg><rect width="${watermarkWidth}" height="${watermarkWidth}" fill="white" opacity="0.3"/></svg>`
          ),
          blend: "in",
        },
      ])
      .png()
      .toBuffer();

    // Calculate position (center of image)
    const left = Math.round((imageMetadata.width - watermarkWidth) / 2);
    const top = Math.round((imageMetadata.height - watermarkWidth) / 2);

    // Composite watermark onto image with multiply blend for subtle effect
    const result = await sharp(imageBuffer)
      .composite([
        {
          input: watermarkBuffer,
          left,
          top,
          blend: "multiply",
        },
      ])
      .toBuffer();

    return result;
  } catch (error) {
    console.error("Error adding watermark:", error);
    // Return original image if watermark fails
    return imageBuffer;
  }
}

/**
 * Add watermark with text overlay
 * @param imageBuffer - Image buffer to add watermark to
 * @param text - Text to overlay
 * @returns Promise<Buffer> - Image buffer with text watermark
 */
export async function addTextWatermark(imageBuffer: Buffer, text: string): Promise<Buffer> {
  try {
    const imageMetadata = await sharp(imageBuffer).metadata();
    if (!imageMetadata.width || !imageMetadata.height) {
      console.warn("Could not get image dimensions, returning original image");
      return imageBuffer;
    }

    // Create SVG text overlay with semi-transparent background
    const fontSize = Math.round(imageMetadata.width * 0.04);
    const svg = Buffer.from(`
      <svg width="${imageMetadata.width}" height="${imageMetadata.height}">
        <defs>
          <style>
            .watermark-text {
              font-family: Arial, sans-serif;
              font-size: ${fontSize}px;
              fill: rgba(100, 120, 140, 0.3);
              text-anchor: middle;
              dominant-baseline: middle;
              font-weight: bold;
            }
          </style>
        </defs>
        <text 
          x="${imageMetadata.width / 2}" 
          y="${imageMetadata.height / 2}" 
          class="watermark-text"
        >
          ${text}
        </text>
      </svg>
    `);

    // Composite SVG onto image
    const result = await sharp(imageBuffer)
      .composite([
        {
          input: svg,
          blend: "over",
        },
      ])
      .toBuffer();

    return result;
  } catch (error) {
    console.error("Error adding text watermark:", error);
    return imageBuffer;
  }
}
