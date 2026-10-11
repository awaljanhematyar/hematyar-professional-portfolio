/**
 * ======================================================
 * PUBLIC SUBMISSION EDGE FUNCTION
 * ======================================================
 *
 * Handles:
 * - Contact messages
 * - Visitor comments
 *
 * Security:
 * - CORS protection
 * - Input validation
 * - Honeypot bot protection
 * - Rate limiting
 *
 * Email:
 * - Resend notification
 *
 * ======================================================
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ======================================================
// ENVIRONMENT VARIABLES
// ======================================================

const url = Deno.env.get("SUPABASE_URL") ?? "";

const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const salt = Deno.env.get("SUBMISSION_SALT") ?? "";

// Allowed frontend URLs

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "http://localhost:5173")
  .split(",")
  .map((item) => item.trim());

// Database client

const db = createClient(url, serviceKey);

// Email validation

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ======================================================
// CORS
// ======================================================

function cors(origin: string) {
  const allowed = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowed,

    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",

    "Access-Control-Allow-Methods": "POST, OPTIONS",

    "Access-Control-Max-Age": "86400",

    Vary: "Origin",
  };
}

// ======================================================
// RESPONSE HELPER
// ======================================================

function jsonResponse(body: unknown, status: number, origin: string) {
  return new Response(
    JSON.stringify(body),

    {
      status,

      headers: {
        ...cors(origin),

        "Content-Type": "application/json",
      },
    },
  );
}

// ======================================================
// INPUT CLEANER
// ======================================================

function safeText(value: unknown, min: number, max: number) {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  if (text.length < min || text.length > max) {
    return null;
  }

  return text;
}

// ======================================================
// HASH FUNCTION
// Used for anonymous rate limiting
// ======================================================

async function hash(value: string) {
  const bytes = new TextEncoder().encode(`${salt}|${value}`);

  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

// ======================================================
// RESEND EMAIL NOTIFICATION
// ======================================================

async function sendNotification(data: {
  name: string;

  email: string;

  subject: string;

  message: string;

  created_at?: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");

  const to = Deno.env.get("NOTIFY_ADMIN_EMAIL");

  const from = Deno.env.get("NOTIFY_FROM_EMAIL");

  if (!apiKey || !to || !from) {
    throw new Error("Email provider is not configured.");
  }

  const text = `

New portfolio enquiry

Name:
${data.name}

Email:
${data.email}

Subject:
${data.subject}

Time:
${data.created_at ?? new Date().toISOString()}


Message:

${data.message}

`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",

    headers: {
      Authorization: `Bearer ${apiKey}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      from,

      to: [to],

      subject: "New portfolio enquiry",

      text,

      reply_to: data.email,
    }),
  });

  if (!response.ok) {
    const error = await response.text();

    throw new Error(`Email provider error (${response.status}): ${error.slice(0, 180)}`);
  }
}
// ======================================================
// MAIN EDGE FUNCTION
// ======================================================

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "";

  // ====================================================
  // CORS PREFLIGHT
  // ====================================================

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: cors(origin),
    });
  }

  // Only POST allowed

  if (req.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: "Method not allowed",
      },
      405,
      origin,
    );
  }

  // Check frontend origin

  if (!allowedOrigins.includes(origin)) {
    return jsonResponse(
      {
        ok: false,
        error: "Origin not allowed",
      },
      403,
      origin,
    );
  }

  // Check server configuration

  if (!url || !serviceKey || salt.length < 20) {
    return jsonResponse(
      {
        ok: false,
        error: "Server setup incomplete",
      },
      503,
      origin,
    );
  }

  try {
    // ==================================================
    // REQUEST SIZE LIMIT
    // ==================================================

    const length = Number(req.headers.get("content-length") ?? "0");

    if (length > 12000) {
      return jsonResponse(
        {
          ok: false,
          error: "Request too large",
        },
        413,
        origin,
      );
    }

    const body = await req.json();

    const { kind, payload, website } = body;

    // ==================================================
    // HONEYPOT BOT PROTECTION
    // ==================================================

    if (website) {
      return jsonResponse(
        {
          ok: true,
        },
        200,
        origin,
      );
    }

    // ==================================================
    // FORM TYPE CHECK
    // ==================================================

    if (kind !== "contact" && kind !== "comments") {
      return jsonResponse(
        {
          ok: false,
          error: "Invalid form type",
        },
        400,
        origin,
      );
    }

    // ==================================================
    // VALIDATE INPUT
    // ==================================================

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
    ) {
      return jsonResponse(
        {
          ok: false,
          error: "Check your form fields.",
        },

        400,

        origin,
      );
    }

    // ==================================================
    // RATE LIMIT IDENTIFIER
    // ==================================================

    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";

    const keys = [
      await hash(`ip:${ip}:${kind}`),

      await hash(`email:${email.toLowerCase()}:${kind}`),
    ];

    for (const key of keys) {
      const { data: allowed, error } = await db.rpc("check_submission_limit", {
        p_hash: key,

        p_limit: 5,
      });

      if (error) {
        throw error;
      }

      if (!allowed) {
        return jsonResponse(
          {
            ok: false,
            error: "Too many submissions. Please try again later.",
          },

          429,

          origin,
        );
      }
    }

    // ==================================================
    // COMMENTS
    // ==================================================

    if (kind === "comments") {
      const { error } = await db.from("comments").insert({
        name,

        email,

        comment: content,

        status: "pending",
      });

      if (error) {
        throw error;
      }

      return jsonResponse(
        {
          ok: true,

          moderation: "pending",
        },

        200,

        origin,
      );
    }

    // ==================================================
    // CONTACT MESSAGE
    // ==================================================

    const {
      data: message,

      error,
    } = await db

      .from("contact_messages")

      .insert({
        name,

        email,

        subject,

        message: content,

        notification_status: "pending",
      })

      .select()

      .single();

    if (error) {
      throw error;
    }

    // ==================================================
    // SEND EMAIL
    // ==================================================

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

    return jsonResponse(
      {
        ok: true,

        stored: true,
      },

      200,

      origin,
    );
  } catch (error) {
    console.error("Submission error:", error);

    return jsonResponse(
      {
        ok: false,

        error: "Submission could not be saved.",
      },

      500,

      origin,
    );
  }
});
