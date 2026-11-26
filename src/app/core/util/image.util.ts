import { UploadedFile, uploadToR2 } from '../supabase/r2-upload';

/** Resize an image file to a max width and re-encode as JPEG. */
export function downscaleToBlob(file: File, maxW = 1000, quality = 0.82, png = false): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not process image'))), png ? 'image/png' : 'image/jpeg', quality);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}

/** Validates an image, shrinks it, and uploads it to Cloudflare R2. Throws an Error with a user-friendly message. */
export async function uploadImage(
  file: File,
  folder: 'articles' | 'insights' | 'profiles' | 'magazines',
  maxW = 1000,
  /** keep transparency (PNG) instead of flattening to JPEG */
  png = false
): Promise<UploadedFile> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (JPG, PNG, WebP).');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Image is too large (max 8 MB).');
  }
  const blob = await downscaleToBlob(file, maxW, 0.82, png);
  return uploadToR2(blob, folder, png ? 'png' : 'jpg');
}

/** Validates a PDF and uploads it to Cloudflare R2. Throws an Error with a user-friendly message. */
export async function uploadPdf(file: File): Promise<UploadedFile> {
  if (file.type !== 'application/pdf') {
    throw new Error('Please choose a PDF file.');
  }
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('PDF is too large (max 50 MB).');
  }
  return uploadToR2(file, 'magazines', 'pdf');
}
