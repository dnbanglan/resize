import { fabric } from 'fabric';
import { ExportFormat, ExportSettings } from '../types/editor';

/**
 * Generate a smart auto filename based on current date, time, and content type.
 */
export function generateAutoFileName(format: ExportFormat = 'png'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `edited-image-${year}-${month}-${day}_${hours}${minutes}.${format}`;
}

/**
 * Clean up user input filename and ensure exactly one matching extension
 * preserving all Unicode characters (Bengali, spaces, hyphens, etc.)
 */
export function sanitizeFileName(rawName: string, format: ExportFormat): string {
  let trimmed = rawName.trim();
  if (!trimmed) {
    trimmed = `photo-design-${Date.now()}`;
  }

  // Remove existing file extensions if present at the end
  trimmed = trimmed.replace(/\.(png|jpe?g|webp|gif|svg|bmp)$/i, '');

  // Strip invalid file system characters while leaving Bengali Unicode intact: \ / : * ? " < > |
  trimmed = trimmed.replace(/[\\/:*?"<>|]/g, '_');

  return `${trimmed}.${format}`;
}

/**
 * Check if the browser supports WebP canvas export
 */
export async function isWebPSupported(): Promise<boolean> {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const dataUri = canvas.toDataURL('image/webp');
  return dataUri.indexOf('image/webp') === 5;
}

/**
 * Estimate file size based on resolution, format, and quality
 */
export function estimateFileSize(
  width: number,
  height: number,
  format: ExportFormat,
  quality: number
): string {
  const totalPixels = width * height;
  let estimatedBytes = 0;

  if (format === 'png') {
    // PNG compressed ~ 0.4 to 0.9 bytes per pixel depending on complexity
    estimatedBytes = totalPixels * 0.65;
  } else if (format === 'jpg') {
    // JPEG scales non-linearly with quality
    const qFactor = Math.pow(quality, 1.8);
    estimatedBytes = totalPixels * 0.25 * qFactor + 10240;
  } else if (format === 'webp') {
    // WebP ~ 25% smaller than JPEG at same quality
    const qFactor = Math.pow(quality, 1.6);
    estimatedBytes = totalPixels * 0.18 * qFactor + 8192;
  }

  if (estimatedBytes < 1024) {
    return `${Math.round(estimatedBytes)} B`;
  } else if (estimatedBytes < 1024 * 1024) {
    return `${(estimatedBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(estimatedBytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

/**
 * Export canvas to image file respecting background transparency, dimensions, and format
 */
export async function exportCanvasImage(
  canvas: fabric.Canvas,
  settings: ExportSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    const finalFormat = settings.format;
    const finalName = sanitizeFileName(settings.fileName, finalFormat);

    // Save original canvas state for restoration
    const originalViewport = canvas.viewportTransform ? [...canvas.viewportTransform] : [1, 0, 0, 1, 0, 0];
    const originalWidth = canvas.getWidth();
    const originalHeight = canvas.getHeight();
    const originalBg = canvas.backgroundColor;

    // Reset zoom and viewport to 1:1 for crisp high-resolution export
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    // Handle background color
    if (finalFormat === 'jpg') {
      // JPEG doesn't support transparency; ensure white/solid background
      if (!settings.backgroundColor || settings.backgroundColor === 'transparent') {
        canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
      } else {
        canvas.setBackgroundColor(settings.backgroundColor, canvas.renderAll.bind(canvas));
      }
    } else if (finalFormat === 'png' || finalFormat === 'webp') {
      if (settings.transparentBackground) {
        canvas.setBackgroundColor('', canvas.renderAll.bind(canvas));
      } else {
        canvas.setBackgroundColor(settings.backgroundColor || '#ffffff', canvas.renderAll.bind(canvas));
      }
    }

    canvas.renderAll();

    // Calculate multiplier for custom export dimensions
    const multiplier = settings.width / originalWidth;

    const mimeType = finalFormat === 'png' 
      ? 'image/png' 
      : finalFormat === 'webp' 
        ? 'image/webp' 
        : 'image/jpeg';

    const dataUrl = canvas.toDataURL({
      format: finalFormat === 'jpg' ? 'jpeg' : finalFormat,
      quality: settings.quality,
      multiplier: multiplier,
      enableRetinaScaling: false,
    });

    // Check if webp fallback is needed
    if (finalFormat === 'webp' && !dataUrl.startsWith('data:image/webp')) {
      console.warn('WebP export not fully supported by canvas toDataURL, falling back to PNG');
    }

    // Trigger download
    const link = document.createElement('a');
    link.download = finalName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Restore original canvas setup
    if (originalViewport) {
      canvas.setViewportTransform(originalViewport);
    }
    canvas.setBackgroundColor(originalBg as any, canvas.renderAll.bind(canvas));
    canvas.renderAll();

    return { success: true };
  } catch (err: any) {
    console.error('Export error:', err);
    return { success: false, error: err?.message || 'Unknown export error' };
  }
}
