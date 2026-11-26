import fs from "node:fs/promises";
import path from "node:path";

import nodemailer, { type Transporter } from "nodemailer";

import { DATA_DIR, getDb, now } from "@/lib/db";
import { env } from "@/lib/env";
import type { Email } from "@/lib/mail/templates";

const OUTBOX = path.join(DATA_DIR, "outbox");

let transport: Transporter | null = null;
function getTransport() {
  if (!env.smtp.host) return null;
  transport ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  return transport;
}

function log(orderId: number | null, template: string, to: string, subject: string, status: string, error?: string) {
  getDb()
    .prepare("INSERT INTO email_log (order_id, template, recipient, subject, status, error, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(orderId, template, to, subject, status, error ?? null, now());
}

/**
 * Sends an email. Without SMTP settings the email is saved to data/outbox/ instead,
 * so the whole order flow works in development. Never throws: a mail problem must not break an order.
 */
export async function sendEmail(options: { to: string; email: Email; template: string; orderId?: number | null; replyTo?: string }) {
  const { to, email, template } = options;
  const orderId = options.orderId ?? null;
  if (!to) return;
  try {
    const t = getTransport();
    if (t) {
      await t.sendMail({ from: env.mailFrom, to, replyTo: options.replyTo, subject: email.subject, html: email.html, text: email.text });
      log(orderId, template, to, email.subject, "sent");
    } else {
      await fs.mkdir(OUTBOX, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const file = path.join(OUTBOX, `${stamp}-${template}.html`);
      await fs.writeFile(file, `<!-- To: ${to} | Subject: ${email.subject} -->\n${email.html}`);
      log(orderId, template, to, email.subject, "saved");
      console.info(`[mail] SMTP not configured, saved "${email.subject}" for ${to} → ${path.relative(process.cwd(), file)}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(orderId, template, to, email.subject, "failed", message);
    console.error(`[mail] failed to send "${email.subject}" to ${to}:`, message);
  }
}
