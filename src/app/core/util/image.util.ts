import { UploadedFile, uploadToR2 } from '../supabase/r2-upload';

/** Resize an image file to a max width and re-encode as JPEG. */
export function downscaleToBlob(file: File, maxW = 1000, quality = 0.82): Promise<Blob> {
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
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', quality);
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
  maxW = 1000
): Promise<UploadedFile> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (JPG, PNG, WebP).');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Image is too large (max 8 MB).');
  }
  const blob = await downscaleToBlob(file, maxW);
  return uploadToR2(blob, folder, 'jpg');
}
