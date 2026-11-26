import { SIZES } from "@/lib/config";
import { getDb } from "@/lib/db";

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  kind: string;
  color: string | null;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  backImage: string | null;
  sideImage: string | null;
  details: string[];
  featured: boolean;
  active: boolean;
  sortOrder: number;
  stock: Record<string, number>;
  totalStock: number;
};

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  kind: string;
  color: string | null;
  price: number;
  compare_at_price: number | null;
  image: string | null;
  back_image: string | null;
  side_image: string | null;
  details: string;
  featured: number;
  active: number;
  sort_order: number;
};

function stockFor(ids: number[]) {
  const map = new Map<number, Record<string, number>>();
  if (ids.length === 0) return map;
  const rows = getDb()
    .prepare(`SELECT product_id, size, quantity FROM product_stock WHERE product_id IN (${ids.map(() => "?").join(",")})`)
    .all(...ids) as { product_id: number; size: string; quantity: number }[];
  for (const row of rows) {
    const entry = map.get(row.product_id) ?? {};
    entry[row.size] = row.quantity;
    map.set(row.product_id, entry);
  }
  return map;
}

function toProducts(rows: ProductRow[]): Product[] {
  const stock = stockFor(rows.map((r) => r.id));
  return rows.map((r) => {
    const sizes = stock.get(r.id) ?? {};
    const ordered: Record<string, number> = {};
    for (const size of SIZES) ordered[size] = sizes[size] ?? 0;
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      description: r.description,
      category: r.category,
      kind: r.kind,
      color: r.color,
      price: r.price,
      compareAtPrice: r.compare_at_price,
      image: r.image,
      backImage: r.back_image,
      sideImage: r.side_image,
      details: JSON.parse(r.details) as string[],
      featured: r.featured === 1,
      active: r.active === 1,
      sortOrder: r.sort_order,
      stock: ordered,
      totalStock: Object.values(ordered).reduce((sum, n) => sum + n, 0),
    };
  });
}

export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc";

const ORDER_BY: Record<ProductSort, string> = {
  featured: "featured DESC, sort_order ASC",
  newest: "created_at DESC, id DESC",
  "price-asc": "price ASC",
  "price-desc": "price DESC",
};

export function getProducts(options: { category?: string; sort?: ProductSort; includeInactive?: boolean; query?: string } = {}) {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (!options.includeInactive) where.push("active = 1");
  if (options.category) {
    where.push("category = ?");
    params.push(options.category);
  }
  if (options.query) {
    where.push("(name LIKE ? OR description LIKE ?)");
    params.push(`%${options.query}%`, `%${options.query}%`);
  }
  const sql = `SELECT * FROM products ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY ${ORDER_BY[options.sort ?? "featured"]}`;
  return toProducts(getDb().prepare(sql).all(...params) as ProductRow[]);
}

export function getFeaturedProducts(limit = 10) {
  const rows = getDb()
    .prepare("SELECT * FROM products WHERE active = 1 AND featured = 1 ORDER BY sort_order ASC LIMIT ?")
    .all(limit) as ProductRow[];
  return toProducts(rows);
}

export function getProductBySlug(slug: string) {
  const row = getDb().prepare("SELECT * FROM products WHERE slug = ? AND active = 1").get(slug) as ProductRow | undefined;
  return row ? toProducts([row])[0]! : null;
}

export function getProductsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  const rows = getDb()
    .prepare(`SELECT * FROM products WHERE id IN (${ids.map(() => "?").join(",")})`)
    .all(...ids) as ProductRow[];
  return toProducts(rows);
}

export function getRelatedProducts(product: Product, limit = 4) {
  const rows = getDb()
    .prepare("SELECT * FROM products WHERE active = 1 AND id != ? ORDER BY (category = ?) DESC, sort_order ASC LIMIT ?")
    .all(product.id, product.category, limit) as ProductRow[];
  return toProducts(rows);
}

export function updateProduct(id: number, data: { price: number; compareAtPrice: number | null; active: boolean; featured: boolean; stock: Record<string, number> }) {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("UPDATE products SET price = ?, compare_at_price = ?, active = ?, featured = ? WHERE id = ?").run(
      data.price,
      data.compareAtPrice,
      data.active ? 1 : 0,
      data.featured ? 1 : 0,
      id,
    );
    const upsert = db.prepare(
      "INSERT INTO product_stock (product_id, size, quantity) VALUES (?, ?, ?) ON CONFLICT(product_id, size) DO UPDATE SET quantity = excluded.quantity",
    );
    for (const size of SIZES) upsert.run(id, size, Math.max(0, Math.floor(data.stock[size] ?? 0)));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
