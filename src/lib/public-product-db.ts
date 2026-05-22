import type { ProductKind, ProductRecord } from "@/types";

const DB_NAME = "atlas-public-products";
const STORE_NAME = "products";
const DB_VERSION = 1;

type CachedProductEntry = {
  cacheKey: string;
  productType: ProductKind;
  product: ProductRecord;
  updatedAt: number;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "cacheKey" });
        store.createIndex("productType", "productType", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

function isProductRecord(value: unknown): value is ProductRecord {
  if (!value || typeof value !== "object") return false;

  const product = value as Partial<ProductRecord>;
  return (
    typeof product.id === "string" &&
    (product.productType === "product" || product.productType === "pack") &&
    typeof product.name === "string" &&
    typeof product.description === "string" &&
    Array.isArray(product.images) &&
    Array.isArray(product.weightOptions)
  );
}

function makeCacheKey(productType: ProductKind, id: string) {
  return `${productType}:${id}`;
}

export async function readCachedProducts(productType: ProductKind) {
  if (typeof window === "undefined" || !("indexedDB" in window)) return [] as ProductRecord[];

  const database = await openDatabase();
  return new Promise<ProductRecord[]>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("productType");
    const request = index.getAll(IDBKeyRange.only(productType));

    request.onsuccess = () => {
      const items = (request.result as CachedProductEntry[])
        .map((entry) => entry.product)
        .filter((product): product is ProductRecord => isProductRecord(product))
        .sort((left, right) => {
          if (left.featured !== right.featured) return left.featured ? -1 : 1;
          return (right.createdAt ?? "").localeCompare(left.createdAt ?? "");
        });

      resolve(items);
    };

    request.onerror = () => reject(request.error ?? new Error("Failed to read cached products"));
  });
}

export async function readCachedProduct(productType: ProductKind, id: string) {
  if (typeof window === "undefined" || !("indexedDB" in window)) return null;

  const database = await openDatabase();
  return new Promise<ProductRecord | null>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(makeCacheKey(productType, id));

    request.onsuccess = () => {
      const entry = request.result as CachedProductEntry | undefined;
      resolve(entry && isProductRecord(entry.product) ? entry.product : null);
    };

    request.onerror = () => reject(request.error ?? new Error("Failed to read cached product"));
  });
}

export async function saveCachedProducts(items: ProductRecord[]) {
  if (typeof window === "undefined" || !("indexedDB" in window) || !items.length) return;

  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    for (const item of items) {
      const entry: CachedProductEntry = {
        cacheKey: makeCacheKey(item.productType, item.id),
        productType: item.productType,
        product: item,
        updatedAt: Date.now(),
      };
      store.put(entry);
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Failed to write cached products"));
  });
}
