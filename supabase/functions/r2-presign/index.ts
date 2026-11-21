// Supabase Edge Function: returns a short-lived upload link for Cloudflare R2.
// Currently open to anyone (no admin check); only the file type and target folder are validated.
//
// Deploy:   supabase functions deploy r2-presign
// Secrets:  supabase secrets set R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
//                                R2_BUCKET=boardroom-media R2_PUBLIC_URL=https://media.yourdomain.com

import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@3';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@3';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const FOLDERS = ['articles', 'insights', 'profiles', 'magazines'];

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${Deno.env.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY')!,
  },
  // R2 rejects the SDK's newer default checksum headers on presigned uploads.
  requestChecksumCalculation: 'WHEN_REQUIRED',
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  // NOTE: uploads are currently open to anyone (no admin check). File type and folder are still validated below.
  // To restrict to admins again, check public.is_admin() here using the caller's JWT.

  const { folder, contentType, ext } = await req.json();
  if (!FOLDERS.includes(folder) || !ALLOWED_TYPES.includes(contentType) || !/^[a-z0-9]{2,5}$/.test(ext)) {
    return json({ error: 'Bad request' }, 400);
  }

  const key = `${folder}/${crypto.randomUUID()}.${ext}`;
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: Deno.env.get('R2_BUCKET')!, Key: key, ContentType: contentType }),
    { expiresIn: 300 },
  );

  return json({ uploadUrl, key, publicUrl: `${Deno.env.get('R2_PUBLIC_URL')}/${key}` });
});
