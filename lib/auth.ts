import crypto from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";

const COOKIE = "rail_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret() {
  if (env.sessionSecret.length < 32) throw new Error("SESSION_SECRET must be set to at least 32 characters in .env.local");
  return env.sessionSecret;
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function adminConfigured() {
  return env.adminPassword.length >= 8 && env.sessionSecret.length >= 32;
}

export function checkPassword(password: string) {
  if (!adminConfigured()) return false;
  // Compare hashes so the comparison is constant-time regardless of length.
  const a = crypto.createHash("sha256").update(password).digest();
  const b = crypto.createHash("sha256").update(env.adminPassword).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function startAdminSession() {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const value = `${expires}.${sign(`admin.${expires}`)}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(`admin.${expires}`));
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
