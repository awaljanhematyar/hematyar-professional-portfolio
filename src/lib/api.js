/**
 * ======================================================
 * SHARED DATABASE / STORAGE OPERATIONS
 * ======================================================
 *
 * Single place for:
 * - Public reads
 * - Admin reads
 * - Create / Update
 * - Delete
 * - Upload assets
 * - Edge Function calls
 *
 * Security:
 * - Supabase RLS controls permissions.
 * - Edge Functions protect sensitive actions.
 *
 * ======================================================
 */

import { supabase, configured } from "./supabase.js";

// ======================================================
// TABLE LIST
// ======================================================

export const TABLES = [
  "skills",

  "projects",

  "experience",

  "education",

  "certificates",

  "services",

  "social_links",

  "project_images",
];

// ======================================================
// PUBLIC READ
// ======================================================
//
// IMPORTANT:
// We use select("*") because database columns
// are controlled by Supabase schema.
// Do not guess column names.
//

export async function readPublic(table) {
  const { data, error } = await supabase

    .from(table)

    .select("*")

    .eq("published", true)

    .order("sort_order", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

// ======================================================
// SINGLE ROW READ
// Used for:
// - profiles
// - site_settings
// ======================================================

export async function readSingleton(table) {
  const { data, error } = await supabase

    .from(table)

    .select("*")

    .eq("id", true)

    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

// ======================================================
// ADMIN READ
// ======================================================

export async function readAdmin(table) {
  const { data, error } = await supabase

    .from(table)

    .select("*")

    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

// ======================================================
// SAVE RECORD
// CREATE OR UPDATE
// ======================================================

export async function saveRecord(table, record, id = null) {
  const {
    data,

    error,
  } =
    id === null
      ? await supabase

          .from(table)

          .insert(record)

          .select()

          .single()
      : await supabase

          .from(table)

          .update(record)

          .eq("id", id)

          .select()

          .single();

  if (error) {
    throw error;
  }

  return data;
}

// ======================================================
// DELETE RECORD
// ======================================================

export async function removeRecord(table, id) {
  const { error } = await supabase

    .from(table)

    .delete()

    .eq("id", id);

  if (error) {
    throw error;
  }
}

// ======================================================
// UPLOAD PUBLIC ASSET
// ======================================================

export async function uploadPublicAsset(file, folder) {
  if (!configured) {
    throw new Error("Supabase is not configured.");
  }

  const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

  if (!allowed.includes(file.type)) {
    throw new Error("Only PNG, JPEG, WebP and PDF files are allowed.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Maximum file size: 8 MB.");
  }

  const ext = file.name.split(".").at(-1)?.toLowerCase();

  const randomBytes = new Uint8Array(16);

  globalThis.crypto.getRandomValues(randomBytes);

  const uniqueId = Array.from(randomBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  const path = `${folder}/${uniqueId}.${ext}`;

  const { error } = await supabase.storage

    .from("portfolio-public")

    .upload(path, file, {
      contentType: file.type,

      upsert: false,
    });

  if (error) {
    throw error;
  }

  return supabase.storage

    .from("portfolio-public")

    .getPublicUrl(path).data.publicUrl;
}

// ======================================================
// PUBLIC SUBMISSION
// CONTACT + COMMENTS
// ======================================================

export async function submitPublic(kind, payload, website) {
  if (!configured) {
    throw new Error("Connect Supabase to enable submissions.");
  }

  const {
    data,

    error,
  } = await supabase.functions.invoke(
    "public-submit",

    {
      body: {
        kind,

        payload,

        website,
      },
    },
  );

  if (error) {
    throw new Error(error.message || "Submission failed.");
  }

  if (!data?.ok) {
    throw new Error(data?.error || "Submission failed.");
  }

  return data;
}

// ======================================================
// RETRY EMAIL NOTIFICATION
// ======================================================

export async function retryNotification(messageId) {
  const {
    data,

    error,
  } = await supabase.functions.invoke(
    "retry-notification",

    {
      body: {
        messageId,
      },
    },
  );

  if (error || !data?.ok) {
    throw new Error(error?.message || data?.error || "Retry failed.");
  }

  return data;
}
