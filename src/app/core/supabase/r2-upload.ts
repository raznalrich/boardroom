import { supabase } from './supabase';

export interface UploadedFile {
  /** Public URL to store in the database row */
  url: string;
  /** R2 object key (kept so the file can be deleted later) */
  key: string;
}

/**
 * Uploads a file to Cloudflare R2.
 * 1. Asks the `r2-presign` Edge Function (admin only) for a short-lived upload link.
 * 2. PUTs the file straight to R2 from the browser.
 * R2 credentials stay inside the Edge Function; see supabase/functions/r2-presign.
 */
export async function uploadToR2(file: Blob, folder: 'articles' | 'insights' | 'profiles' | 'magazines', ext: string): Promise<UploadedFile> {
  const { data, error } = await supabase.functions.invoke('r2-presign', {
    body: { folder, contentType: file.type, ext }
  });
  if (error || !data?.uploadUrl) {
    throw new Error(error?.message ?? 'Could not get an upload link. Is the r2-presign function deployed?');
  }
  const put = await fetch(data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  if (!put.ok) {
    throw new Error(`Upload to storage failed (${put.status}). Check the R2 bucket CORS settings.`);
  }
  return { url: data.publicUrl as string, key: data.key as string };
}
