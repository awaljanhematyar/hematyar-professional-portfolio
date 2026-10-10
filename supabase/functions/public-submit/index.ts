/**
 * PUBLIC SUBMISSION EDGE FUNCTION
 * Handles anonymous contact messages and visitor comments.
 * Security: approved origins, input validation, honeypot and rate limiting.
 * Private emails stay in the database; only moderated comments are public.
 * Requires SUPABASE_SERVICE_ROLE_KEY and SUBMISSION_SALT server-side.
 */
// Deploy as a public Edge Function: supabase functions deploy public-submit --no-verify-jwt
// Supabase service role is used ONLY inside this function, never in React.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const allowed = (Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:5173")
  .split(",")
  .map((x) => x.trim());
const salt = Deno.env.get("SUBMISSION_SALT") || "";
const db = createClient(url, serviceKey);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function cors(origin: string) {
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}
function result(body: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json" },
  });
}
function safeText(s: unknown, min: number, max: number) {
  return typeof s === "string" && s.trim().length >= min && s.trim().length <= max
    ? s.trim()
    : null;
}
// Hash rate-limit identifiers so raw IP/email values are not stored as keys.
async function hash(value: string) {
  const bytes = new TextEncoder().encode(`${salt}|${value}`);
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
// Email delivery is best-effort: message database storage comes first.
export async function sendNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("NOTIFY_ADMIN_EMAIL");
  const from = Deno.env.get("NOTIFY_FROM_EMAIL");
  if (!apiKey || !to || !from) throw new Error("Email provider is not configured.");
  const message = `New portfolio enquiry\nName: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\nTime: ${data.created_at || new Date().toISOString()}\n\n${data.message}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "New portfolio enquiry",
      text: message,
      reply_to: data.email,
    }),
  });
  const body = await response.text();
  if (!response.ok)
    throw new Error(`Email provider error (${response.status}): ${body.slice(0, 180)}`);
}
Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";

  // =====================================================
  // CORS PREFLIGHT REQUEST HANDLER
  // =====================================================
  // The browser sends an OPTIONS request before POST.
  // Return CORS headers so approved websites can connect.
  // HTTP 204 responses must have a null body.
  // =====================================================

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: cors(origin),
    });
  }

  if (req.method !== "POST")
    return result({ ok: false, error: "Method not allowed" }, 405, origin);
  if (!allowed.includes(origin))
    return result({ ok: false, error: "Origin not allowed" }, 403, origin);
  if (!url || !serviceKey || salt.length < 20)
    return result({ ok: false, error: "Server setup incomplete" }, 503, origin);
  try {
    if (Number(req.headers.get("content-length") || "0") > 12000)
      return result({ ok: false, error: "Request too large" }, 413, origin);
    const { kind, payload, website } = await req.json();
    if (website) return result({ ok: true }, 200, origin); // honeypot traps bots without storing data
    if (kind !== "contact" && kind !== "comments")
      return result({ ok: false, error: "Invalid form type" }, 400, origin);
    const name = safeText(payload?.name, 2, 100);
    const email = safeText(payload?.email, 5, 255);
    const content = safeText(
      kind === "contact" ? payload?.message : payload?.comment,
      kind === "contact" ? 5 : 3,
      5000,
    );
    const subject = kind === "contact" ? safeText(payload?.subject, 3, 150) : null;
    if (
      !name ||
      !email ||
      !emailPattern.test(email) ||
      !content ||
      (kind === "contact" && !subject)
    )
      return result({ ok: false, error: "Check your form fields." }, 400, origin);
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";
    // Two independent rate-limit buckets: origin IP and submitted email.
    const keys = [
      await hash(`ip:${ip}:${kind}`),
      await hash(`email:${email.toLowerCase()}:${kind}`),
    ];
    for (const k of keys) {
      const { data: permitted, error } = await db.rpc("check_submission_limit", {
        p_hash: k,
        p_limit: 5,
      });
      if (error) throw error;
      if (!permitted)
        return result(
          { ok: false, error: "Too many submissions. Please try again later." },
          429,
          origin,
        );
    }
    if (kind === "comments") {
      const { error } = await db
        .from("comments")
        .insert({ name, email, comment: content, status: "pending" });
      if (error) throw error;
      return result({ ok: true, moderation: "pending" }, 200, origin);
    }
    const { data: message, error } = await db
      .from("contact_messages")
      .insert({ name, email, subject, message: content, notification_status: "pending" })
      .select()
      .single();
    if (error) throw error;
    try {
      await sendNotification(message);
      await db
        .from("contact_messages")
        .update({
          notification_status: "sent",
          notification_sent_at: new Date().toISOString(),
          notification_attempts: 1,
          notification_error: null,
        })
        .eq("id", message.id);
    } catch (mailError) {
      await db
        .from("contact_messages")
        .update({
          notification_status: "failed",
          notification_attempts: 1,
          notification_error: String(mailError).slice(0, 500),
        })
        .eq("id", message.id);
    }
    return result({ ok: true, stored: true }, 200, origin);
  } catch (e) {
    console.error("Submission error:", e);
    return result({ ok: false, error: "Submission could not be saved." }, 500, origin);
  }
});
