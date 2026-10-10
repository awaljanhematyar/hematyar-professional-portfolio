/**
 * SHARED DATABASE / STORAGE OPERATIONS
 * This is the app's single place for basic reads, writes, public uploads,
 * and invoking server-side Edge Functions. Authorization lives in RLS.
 */
import { supabase, configured } from "./supabase.js";
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

/** Public table read; show only published records in specified order. */
export async function readPublic(table) {
  const q = supabase
    .from(table)
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}
/** Read a one-row table (profile / site settings, where id = true). */
export async function readSingleton(table) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", true)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
/** Admin-only reads; protected by database policies. */
export async function readAdmin(table) {
  const q = supabase.from(table).select("*");
  const { data, error } = await (["comments", "contact_messages"].includes(
    table,
  )
    ? q.order("created_at", { ascending: false })
    : q.order("created_at", { ascending: false }));
  if (error) throw error;
  return data ?? [];
}
/** Insert a new record or update a record with the given ID. */
export async function saveRecord(table, record, id = null) {
  const { data, error } =
    id === null
      ? await supabase.from(table).insert(record).select().single()
      : await supabase
          .from(table)
          .update(record)
          .eq("id", id)
          .select()
          .single();
  if (error) throw error;
  return data;
}
/** Delete a record; Admin UI should confirm destructive actions first. */
export async function removeRecord(table, id) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}
/**
 * Upload an approved image/PDF to the public portfolio bucket.
 * Storage policies are responsible for preventing unauthorized uploads.
 */
export async function uploadPublicAsset(file, folder) {
  if (!configured) throw new Error("Supabase is not configured.");
  const allow = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
  if (!allow.includes(file.type))
    throw new Error("Only PNG, JPEG, WebP and PDF files are allowed.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Maximum file size: 8 MB.");
  const ext = file.name.split(".").at(-1)?.toLowerCase();
  // The filename uses cryptographically random bytes (no crypto.randomUUID dependency).
  const randomBytes = new Uint8Array(16);

  globalThis.crypto.getRandomValues(randomBytes);

  const uniqueId = Array.from(randomBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  const path = `${folder}/${uniqueId}.${ext}`;
  const { error } = await supabase.storage
    .from("portfolio-public")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from("portfolio-public").getPublicUrl(path).data
    .publicUrl;
}
/** Server-side contact / comment handler; does not write private data in browser. */
export async function submitPublic(kind, payload, website) {
  if (!configured) throw new Error("Connect Supabase to enable submissions.");
  const { data, error } = await supabase.functions.invoke("public-submit", {
    body: { kind, payload, website },
  });
  if (error) throw new Error(error.message || "Submission failed.");
  if (!data?.ok) throw new Error(data?.error || "Submission failed.");
  return data;
}
/** Ask the protected Edge Function to retry a failed message email. */
export async function retryNotification(messageId) {
  const { data, error } = await supabase.functions.invoke(
    "retry-notification",
    { body: { messageId } },
  );
  if (error || !data?.ok)
    throw new Error(error?.message || data?.error || "Retry failed.");
  return data;
}
