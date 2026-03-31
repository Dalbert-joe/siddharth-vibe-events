import type { VercelRequest, VercelResponse } from "@vercel/node";

const API_KEY = process.env.GOOGLE_API_KEY!;
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;
const DRIVE_BASE = "https://www.googleapis.com/drive/v3";

const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 30;
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < windowMs
  );
  if (timestamps.length >= maxRequests) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  return res.json();
}

async function getSubFolders(folderId: string) {
  const url = `${DRIVE_BASE}/files?q='${folderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name)&key=${API_KEY}`;
  const data = await fetchJson(url);
  return data.files || [];
}

async function getFilesInFolder(folderId: string) {
  const url = `${DRIVE_BASE}/files?q='${folderId}'+in+parents+and+(mimeType+contains+'image/'+or+mimeType+contains+'video/')+and+trashed=false&fields=files(id,name,mimeType,thumbnailLink)&pageSize=50&key=${API_KEY}`;
  const data = await fetchJson(url);
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    thumbnailUrl: f.thumbnailLink
      ? f.thumbnailLink.replace("=s220", "=s800")
      : null,
    directUrl: `https://lh3.googleusercontent.com/d/${f.id}`,
    embedUrl: f.mimeType?.startsWith("video/")
      ? `https://drive.google.com/file/d/${f.id}/preview`
      : null,
  }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] || "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  res.setHeader("Access-Control-Allow-Origin", "https://siddharthevents.in");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  try {
    const subFolders = await getSubFolders(ROOT_FOLDER_ID);

    const books = await Promise.all(
      subFolders.map(async (folder: { id: string; name: string }) => {
        const files = await getFilesInFolder(folder.id);
        return {
          id: folder.id,
          name: folder.name,
          files,
          coverUrl: files[0]?.directUrl || null,
        };
      })
    );

    const previewFiles = await getFilesInFolder(ROOT_FOLDER_ID);

    return res.status(200).json({
      books: books.filter((b) => b.files.length > 0),
      preview: previewFiles.slice(0, 6),
    });
  } catch (err: any) {
    console.error("Drive API error:", err.message);
    return res.status(500).json({ error: "Failed to fetch gallery" });
  }
}
