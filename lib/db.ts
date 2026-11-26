import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { seedProducts } from "@/lib/seed";

export const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "store.db");

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'tee',
  color TEXT,
  price INTEGER NOT NULL,
  compare_at_price INTEGER,
  image TEXT,
  back_image TEXT,
  side_image TEXT,
  details TEXT NOT NULL DEFAULT '[]',
  featured INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_stock (
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  PRIMARY KEY (product_id, size)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  status TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  postal_code TEXT,
  notes TEXT,
  subtotal INTEGER NOT NULL,
  shipping_fee INTEGER NOT NULL,
  total INTEGER NOT NULL,
  payment_due_at TEXT NOT NULL,
  payment_reference TEXT,
  payment_slip TEXT,
  payment_submitted_at TEXT,
  paid_at TEXT,
  tracking_carrier TEXT,
  tracking_number TEXT,
  shipped_at TEXT,
  delivered_at TEXT,
  cancelled_at TEXT,
  cancel_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_email_idx ON orders(email);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  image TEXT,
  size TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  line_total INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

CREATE TABLE IF NOT EXISTS order_events (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS order_events_order_idx ON order_events(order_id);

CREATE TABLE IF NOT EXISTS email_log (
  id INTEGER PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  template TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS email_log_order_idx ON email_log(order_id);
`;

function open() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA);
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM products").get() as { count: number };
  if (count === 0) seedProducts(db);
  return db;
}

const globalForDb = globalThis as unknown as { __storeDb?: DatabaseSync };

export function getDb() {
  if (!globalForDb.__storeDb) globalForDb.__storeDb = open();
  return globalForDb.__storeDb;
}

/** Runs `fn` inside a write transaction (BEGIN IMMEDIATE), rolling back on error. */
export function transaction<T>(fn: (db: DatabaseSync) => T): T {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn(db);
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function now() {
  return new Date().toISOString();
}
