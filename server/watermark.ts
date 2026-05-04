import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Adiciona marca d'água a uma imagem com opacidade
 * @param imageBuffer Buffer da imagem original
 * @param logoPath Caminho do arquivo de logo
 * @returns Buffer da imagem com marca d'água
 * @throws Error se o logo não existir ou se houver erro ao processar
 */
export async function addWatermark(
  imageBuffer: Buffer,
  logoPath: string = '/home/ubuntu/webdev-static-assets/leticia-souza-logo.jpg'
): Promise<Buffer> {
  // Verificar se o logo existe
  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo não encontrado em ${logoPath}`);
  }

  try {
    // Obter metadados da imagem original
    const metadata = await sharp(imageBuffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Não foi possível obter dimensões da imagem');
    }

    // Calcular tamanho do logo (15% da largura da imagem)
    const logoWidth = Math.round(metadata.width * 0.15);
    if (logoWidth < 1) {
      throw new Error('Imagem muito pequena para adicionar marca d\'água');
    }

    // Redimensionar logo
    const resizedLogo = await sharp(logoPath)
      .resize(logoWidth, logoWidth, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    // Calcular posição central
    const left = Math.round((metadata.width - logoWidth) / 2);
    const top = Math.round((metadata.height - logoWidth) / 2);

    // Adicionar logo com blend multiply para efeito sutil e semi-transparente
    const watermarkedImage = await sharp(imageBuffer)
      .composite([
        {
          input: resizedLogo,
          left,
          top,
          blend: 'multiply',
        },
      ])
      .jpeg({ quality: 80 })
      .toBuffer();

    console.log('[watermark] Marca d\'água adicionada com sucesso');
    return watermarkedImage;
  } catch (error) {
    console.error('[watermark] Erro ao adicionar marca d\'água:', error);
    throw new Error(`Erro ao adicionar marca d'água: ${error instanceof Error ? error.message : String(error)}`);
  }
}
