/** Server-only settings read from environment variables (.env.local). Never import from client components. */

export const env = {
  siteUrl: (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? "",
  /** Where "new order" and "slip uploaded" notifications go. */
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  mailFrom: process.env.MAIL_FROM ?? "Rail <orders@rail.example>",
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
  },
};
