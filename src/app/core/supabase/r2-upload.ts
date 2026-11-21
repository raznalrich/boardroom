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
  let put: Response;
  try {
    put = await fetch(data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  } catch {
    // The browser gives no detail for a blocked request. These are the usual causes.
    throw new Error(
      'Could not reach Cloudflare R2. Check that this site\'s address is in the bucket\'s CORS rule, ' +
      'and that your network or firewall allows Cloudflare R2 (*.r2.cloudflarestorage.com).'
    );
  }
  if (!put.ok) {
    throw new Error(`Upload to storage failed (${put.status}). Check the R2 bucket CORS settings.`);
  }
  return { url: data.publicUrl as string, key: data.key as string };
}
