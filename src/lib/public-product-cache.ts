import type { ProductKind, ProductRecord, ProductWeightOption } from "@/types";

type CacheKey = `${ProductKind}:${string}`;
type ProductCacheMap = Record<CacheKey, ProductRecord>;

const CACHE_KEY = "atlas-public-product-cache-v1";

function isWeightOption(value: unknown): value is ProductWeightOption {
  if (!value || typeof value !== "object") return false;
  const option = value as Partial<ProductWeightOption>;
  return typeof option.label === "string" && typeof option.price === "number";
}

function isProductRecord(value: unknown): value is ProductRecord {
  if (!value || typeof value !== "object") return false;

  const product = value as Partial<ProductRecord>;
  return (
    typeof product.id === "string" &&
    (product.productType === "product" || product.productType === "pack") &&
    typeof product.name === "string" &&
    typeof product.description === "string" &&
    typeof product.stock === "number" &&
    typeof product.featured === "boolean" &&
    typeof product.active === "boolean" &&
    Array.isArray(product.images) &&
    product.images.every((image) => typeof image === "string") &&
    Array.isArray(product.weightOptions) &&
    product.weightOptions.every((option) => isWeightOption(option))
  );
}

function makeCacheKey(id: string, productType: ProductKind) {
  return `${productType}:${id}` as CacheKey;
}

function readCache(): ProductCacheMap {
  if (typeof window === "undefined") return {} as ProductCacheMap;

  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return {} as ProductCacheMap;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {} as ProductCacheMap;

    const next = {} as ProductCacheMap;
    for (const [key, value] of Object.entries(parsed)) {
      if (isProductRecord(value)) {
        next[key as CacheKey] = value;
      }
    }

    return next;
  } catch {
    return {} as ProductCacheMap;
  }
}

function writeCache(cache: ProductCacheMap) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

function sortProducts(items: ProductRecord[]) {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) return left.featured ? -1 : 1;
    return (right.createdAt ?? "").localeCompare(left.createdAt ?? "");
  });
}

export function getCachedProduct(id: string, productType: ProductKind) {
  const cache = readCache();
  return cache[makeCacheKey(id, productType)] ?? null;
}

export function getCachedProductCollection(productType: ProductKind) {
  const cache = readCache();
  return sortProducts(Object.values(cache).filter((item) => item.productType === productType && item.active));
}

export function saveCachedProduct(product: ProductRecord) {
  const cache = readCache();
  cache[makeCacheKey(product.id, product.productType)] = product;
  writeCache(cache);
}

export function saveCachedProducts(products: ProductRecord[]) {
  if (!products.length) return;

  const cache = readCache();
  for (const product of products) {
    cache[makeCacheKey(product.id, product.productType)] = product;
  }
  writeCache(cache);
}
