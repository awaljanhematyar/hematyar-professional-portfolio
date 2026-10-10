/**
 * SUPABASE CLIENT SETUP
 * VITE_ variables are bundled into the browser, so only PUBLIC keys belong here.
 * NEVER put service_role, database passwords, or email API secrets in this file.
 */
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const configured = Boolean(url && key);

// Without public configuration, the portfolio runs in preview-only mode.
export const supabase = configured
  ? createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
