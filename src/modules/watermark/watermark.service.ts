import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

const WATERMARK_TEXT = 'GUIA DO JOB';

@Injectable()
export class WatermarkService {
  private readonly logger = new Logger(WatermarkService.name);

  async apply(imageBuffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width ?? 800;
    const height = metadata.height ?? 600;

    const fontSize = Math.max(Math.floor(width / 20), 16);
    const svgOverlay = this.createSvgOverlay(width, height, fontSize);

    const result = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgOverlay),
          gravity: 'center',
        },
      ])
      .toBuffer();

    this.logger.debug(`Watermark applied (${width}x${height})`);
    return result;
  }

  private createSvgOverlay(width: number, height: number, fontSize: number): string {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="wm" x="0" y="0" width="${fontSize * 12}" height="${fontSize * 6}"
                   patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
            <text x="0" y="${fontSize}" font-family="Arial, sans-serif" font-size="${fontSize}"
                  fill="rgba(255,255,255,0.25)" font-weight="bold">${WATERMARK_TEXT}</text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wm)" />
      </svg>
    `.trim();
  }
}
