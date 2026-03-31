import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 5;
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < windowMs
  );
  if (timestamps.length >= maxRequests) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

function sanitize(str: string): string {
  return str
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, 1000);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] || "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait." });
  }

  res.setHeader("Access-Control-Allow-Origin", "https://siddharthevents.in");
  res.setHeader("Access-Control-Allow-Methods", "POST");

  const { name, phone, message } = req.body || {};

  if (!name || !phone || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  const cleanName = sanitize(name);
  const cleanPhone = sanitize(phone);
  const cleanMessage = sanitize(message);

  if (cleanName.length < 2) {
    return res.status(400).json({ error: "Name too short" });
  }

  const { error } = await supabase.from("feedback").insert([
    { name: cleanName, phone: cleanPhone, message: cleanMessage },
  ]);

  if (error) {
    console.error("Supabase error:", error.message);
    return res.status(500).json({ error: "Failed to save feedback" });
  }

  return res.status(200).json({ success: true });
}
