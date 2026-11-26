import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { DATA_DIR } from "@/lib/db";

export const SLIP_DIR = path.join(DATA_DIR, "slips");
export const MAX_SLIP_BYTES = 5 * 1024 * 1024;

const TYPES = {
  jpg: { mime: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  png: { mime: "image/png", magic: [0x89, 0x50, 0x4e, 0x47] },
  webp: { mime: "image/webp", magic: [0x52, 0x49, 0x46, 0x46] },
  pdf: { mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] },
} as const;

type Ext = keyof typeof TYPES;

/** Detects the file type from its first bytes, ignoring the browser-supplied name and type. */
function sniff(bytes: Uint8Array): Ext | null {
  for (const [ext, { magic }] of Object.entries(TYPES) as [Ext, (typeof TYPES)[Ext]][]) {
    if (magic.every((b, i) => bytes[i] === b)) {
      if (ext === "webp" && String.fromCharCode(...bytes.slice(8, 12)) !== "WEBP") continue;
      return ext;
    }
  }
  return null;
}

export class UploadError extends Error {}

/** Saves a bank slip and returns its stored file name. */
export async function saveSlip(orderNumber: string, file: File) {
  if (!file || file.size === 0) throw new UploadError("Choose a photo or PDF of your bank slip.");
  if (file.size > MAX_SLIP_BYTES) throw new UploadError("The file is larger than 5 MB. Try a smaller photo.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniff(bytes);
  if (!ext) throw new UploadError("Upload a JPG, PNG, WEBP or PDF file.");
  await fs.mkdir(SLIP_DIR, { recursive: true });
  const name = `${orderNumber}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  await fs.writeFile(path.join(SLIP_DIR, name), bytes);
  return name;
}

/** Reads a stored slip. Only accepts names produced by saveSlip. */
export async function readSlip(name: string) {
  if (!/^[A-Z0-9-]+-[a-f0-9]{12}\.(jpg|png|webp|pdf)$/.test(name)) return null;
  try {
    const data = await fs.readFile(path.join(SLIP_DIR, name));
    const ext = name.split(".").pop() as Ext;
    return { data, mime: TYPES[ext].mime };
  } catch {
    return null;
  }
}
