import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, valid);
  }
}, 60 * 60 * 1000);

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (typeof req.headers["x-real-ip"] === "string") return req.headers["x-real-ip"];
  return "unknown";
}

function sanitize(str: string): string {
  return str
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim()
    .slice(0, 1000);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Access-Control-Allow-Origin", "https://siddharthevents.in");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "Too many requests. Please wait 10 minutes before trying again.",
    });
  }

  const { name, phone, message } = req.body || {};

  if (!name || !phone || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (
    typeof name !== "string" ||
    typeof phone !== "string" ||
    typeof message !== "string"
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
  if (!phoneRegex.test(phone.trim())) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  const cleanName = sanitize(name);
  const cleanPhone = sanitize(phone);
  const cleanMessage = sanitize(message);

  if (cleanName.length < 2) return res.status(400).json({ error: "Name too short" });
  if (cleanMessage.length < 5) return res.status(400).json({ error: "Message too short" });

  const { error } = await supabase
    .from("feedback")
    .insert([{ name: cleanName, phone: cleanPhone, message: cleanMessage }]);

  if (error) {
    console.error("Supabase error:", error.message);
    return res.status(500).json({ error: "Failed to save feedback" });
  }

  return res.status(200).json({ success: true });
}
