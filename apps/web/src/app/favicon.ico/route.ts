import { readFile } from "node:fs/promises";
import path from "node:path";

const ICON_FILENAME = "ChatGPT Image Jan 12, 2026, 12_43_46 AM.ico";

export async function GET() {
  const iconPath = path.resolve(process.cwd(), "..", "..", ICON_FILENAME);
  const iconBuffer = await readFile(iconPath);

  return new Response(iconBuffer, {
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
