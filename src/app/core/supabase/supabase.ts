import { createClient } from '@supabase/supabase-js';

/**
 * Supabase connection.
 * The URL and the publishable (anon) key are designed to be public: access is controlled by the
 * Row Level Security policies in supabase/schema.sql. NEVER put the service_role key or R2 secrets here.
 */
export const SUPABASE_URL = 'https://elmaqqzednccgkdrxarr.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_uNZavjcuPxaxpW7n95jGgA__bmm7wGj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/** Supabase error code for a unique-constraint violation (e.g. a duplicate email). */
export const UNIQUE_VIOLATION = '23505';

/**
 * Turns a database error into a message a person can act on.
 * "row-level security" means the database is refusing the save for the current role: the permission SQL has not been run yet.
 */
export function dbError(error: { code?: string; message: string }): string {
  if (error.code === '42501' || /row-level security/i.test(error.message)) {
    return 'The database blocked this change (row-level security). In the Supabase SQL Editor, run supabase/dev-open-access.sql, then try again.';
  }
  return error.message;
}
