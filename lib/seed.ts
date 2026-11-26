import type { DatabaseSync } from "node:sqlite";

import { SIZES } from "@/lib/config";

const CDN = "https://cdn.21st.dev/assets/mirror";

type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  kind: string;
  color: string;
  price: number;
  compareAt?: number;
  description: string;
  details: string[];
  images: [string, string, string];
  featured?: boolean;
  stock: number[];
};

const PRODUCTS: SeedProduct[] = [
  {
    slug: "heavyweight-tee-bone", name: "Heavyweight tee · Bone", category: "tees", kind: "tee", color: "#EFEBE2", price: 4800,
    description: "240 gsm organic cotton with a tonal DHxWHY embroidery on the chest. Cut for a regular fit that holds its shape wash after wash.",
    details: ["240 gsm", "Regular fit", "Tonal embroidery"], featured: true, stock: [4, 10, 12, 8, 3],
    images: ["14/1485bf44725b18fcdba71bfae54d67d648ab3bff4b24215a042c0cc4c895a2e6", "69/69937e656430ae33d950303e0d53051273e5b02189750ef1e7429ec4bbf95e20", "83/838468c32f16b4acba62e4601276737411156052444712ff2534fefe994a7bed"],
  },
  {
    slug: "graphic-tee-ccgather", name: "Graphic tee · CCgather", category: "tees", kind: "tee", color: "#101214", price: 5200,
    description: "Black tee with the CCgather wordmark printed front and back in a soft-hand screen print.",
    details: ["240 gsm", "Regular fit", "Screen print"], featured: true, stock: [2, 8, 10, 6, 4],
    images: ["d7/d769f183472d0fd98a7aff2a643593748cd36ef9da1497d9bf6f0d87d1025a9b", "fe/fec6f7e96b198cc5b9aad333ca2c4c10968a746d87f6dc11d9c118607b509058", "b3/b3b6984ea94b8b8cd19fb15387e89dca457ac0f947115c2a54a33217e4fb4571"],
  },
  {
    slug: "oxford-shirt-sky", name: "Oxford shirt · Sky", category: "shirts", kind: "shirt", color: "#A3D3EB", price: 7400,
    description: "Pale sky oxford with a button-down collar and a tiny Maestiq embroidery. Breathable enough for Colombo afternoons.",
    details: ["Oxford cotton", "Button-down collar", "Chest pocket"], featured: true, stock: [3, 6, 6, 5, 2],
    images: ["47/470a7723cef068f81e8a4c09d1ab3f8630c61b734c2168b10f3858e45efbf31f", "9b/9be14e5dce879756775677e2d82dadc2ad9a1690b7df2f82de360cb3600d0ee5", "59/5984d5ca60fd1aeee7e688ec33c2219a1c537fcde90d2accab813c13985f8632"],
  },
  {
    slug: "knit-cardigan-olive", name: "Knit cardigan · Olive", category: "knitwear", kind: "knit", color: "#758151", price: 9600, compareAt: 11500,
    description: "Chunky olive wool cardigan with wooden buttons and ribbed trims. Made for hill-country evenings.",
    details: ["Lambswool", "Wooden buttons", "V-neck"], featured: true, stock: [1, 4, 5, 3, 0],
    images: ["58/581b13c5ca241c653dc94d2c8048c92a60f022cfbaaf153261076d3a6655827e", "d9/d9178d906d37268565cf10af3431aee543aacfc73610f7fa7b0fa4758c498cb3", "de/dee1c529600e0460413f1a9b07a29bedb7ea7dc96181fce5d9d6501231e6e45d"],
  },
  {
    slug: "hoodie-maestiq", name: "Hoodie · Maestiq", category: "sweats", kind: "hoodie", color: "#A0A5AB", price: 8800,
    description: "Heather fleece hoodie with the Maestiq wordmark across the chest and a roomy kangaroo pocket.",
    details: ["400 gsm fleece", "Kangaroo pocket", "Chest print"], featured: true, stock: [2, 7, 9, 7, 4],
    images: ["51/51750ba098dd622df46695bca781b3f0ec336a36b93b070e638cc04455def6d6", "e7/e75c4ac8fb7f14caae756338a31f81f1437bb312b78e0d7d906e9f956e7968fa", "a2/a2eb2463d52146c341ede6bb9f6067e917a23eb29b7b1d1d4c40ac084a01c7ce"],
  },
  {
    slug: "crewneck-sweatshirt-lilac", name: "Crewneck sweatshirt · Lilac", category: "sweats", kind: "knit", color: "#CCB2E0", price: 7800,
    description: "Muted lilac fleece crewneck with a raised DHxWHY puff print.",
    details: ["400 gsm fleece", "Ribbed trims", "Puff print"], featured: true, stock: [3, 5, 6, 4, 2],
    images: ["8e/8e38660e2add9637c27846d9b8d620f2abb228a5a153ccfd7b1c808b6845e1f8", "b9/b9214a6e009ce4b3044595a51ea010c299135bab5b26775c43d7175c86e77898", "59/591872e42b483c43c1cd08a3ac4d7d40c0b5fa2bc585a36096faded2e696e84e"],
  },
  {
    slug: "pique-polo-forest", name: "Piqué polo · Forest", category: "tees", kind: "tee", color: "#185B37", price: 6200,
    description: "Forest piqué polo with a bone CCgather embroidery on the chest and a two-button placket.",
    details: ["Piqué knit", "Two-button placket", "Embroidered"], featured: true, stock: [2, 6, 8, 6, 3],
    images: ["19/19fe43cb681195ae227e3164088d86a07a1b6e33cc54c6e35637374736a16894", "e0/e095182b1a7f04e600c5662aa871b4c055c294b152586817d84e312c22f744cf", "00/005a8e10be234bc40917f3153208b8196ba1610c53c987e39942da1f4a7cd808"],
  },
  {
    slug: "henley-brick", name: "Henley · Brick", category: "knitwear", kind: "knit", color: "#B05139", price: 5600,
    description: "Dusty brick henley with a three-button placket, worn in from day one.",
    details: ["Slub cotton", "Three buttons", "Long sleeve"], featured: true, stock: [2, 5, 7, 5, 2],
    images: ["84/84aa4b0e21ed11fcbc083647a607b94ee3a6c21cb66c114cfb1dad0792c15499", "01/01c299df56a29afca8dad4a64858bd506667338bfbd0435118e6c3698c7881b3", "9c/9ca38eeb156aae7d199d3c1ffb7947e395f77d1f094eea006c1b5fbb22352b4e"],
  },
  {
    slug: "breton-long-sleeve", name: "Breton long sleeve", category: "knitwear", kind: "knit", color: "#E4DFD3", price: 5800,
    description: "Classic ink-and-bone Breton stripe with a boat neck.",
    details: ["220 gsm", "Boat neck", "Long sleeve"], featured: true, stock: [3, 6, 6, 4, 2],
    images: ["09/096002a95aba7de9c197de4cb5c78cbbe17c1677b19c547cc20c6dbef47a899c", "74/74408a7dbb4f4fc6761ebb8d6ed93187248cddf75e1c2e70d38d04dfdd328776", "ed/eda3afca537071a80d7d82b3f0d1055b56f1f3263c20772224bae6660bf4072c"],
  },
  {
    slug: "oversized-tee-ochre", name: "Oversized tee · CCgather", category: "tees", kind: "tee", color: "#DE9C31", price: 5200,
    description: "Boxy ochre tee with a small chest mark and a large CCgather back print.",
    details: ["Oversized", "Dropped shoulder", "Back print"], featured: true, stock: [3, 8, 9, 7, 5],
    images: ["72/7208c811f54e123dd7b1a5c1c3926f43ca832f6c4c20c45de10671ffd544409d", "d3/d356989b7bc741c5cfc934cac34983dfb24d5d6a6b6e7b8b7f6b27cd3eceae69", "bf/bf94beeafb21f9cb21aa45057a67dc8a2e23ba95c7ac0f79dd27ba3ce4a1230c"],
  },
];

export function seedProducts(db: DatabaseSync) {
  const insertProduct = db.prepare(`
    INSERT INTO products (slug, name, description, category, kind, color, price, compare_at_price, image, back_image, side_image, details, featured, active, sort_order, created_at)
    VALUES (:slug, :name, :description, :category, :kind, :color, :price, :compareAt, :image, :backImage, :sideImage, :details, :featured, 1, :sortOrder, :createdAt)
  `);
  const insertStock = db.prepare("INSERT INTO product_stock (product_id, size, quantity) VALUES (?, ?, ?)");
  const createdAt = new Date().toISOString();

  db.exec("BEGIN");
  try {
    PRODUCTS.forEach((p, index) => {
      const [front, back, side] = p.images.map((id) => `${CDN}/${id}.webp`);
      const { lastInsertRowid } = insertProduct.run({
        slug: p.slug,
        name: p.name,
        description: p.description,
        category: p.category,
        kind: p.kind,
        color: p.color,
        price: p.price,
        compareAt: p.compareAt ?? null,
        image: front ?? null,
        backImage: back ?? null,
        sideImage: side ?? null,
        details: JSON.stringify(p.details),
        featured: p.featured ? 1 : 0,
        sortOrder: index,
        createdAt,
      });
      SIZES.forEach((size, i) => insertStock.run(Number(lastInsertRowid), size, p.stock[i] ?? 0));
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
