import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { fetchPublicProductCards } from "@/lib/supabase";
import type { ProductKind, ProductRecord } from "@/types";

type ProductCacheKey = `${ProductKind}:${string}`;
type ProductCacheMap = Record<ProductCacheKey, ProductRecord>;

interface CatalogContextValue {
  products: ProductRecord[];
  packs: ProductRecord[];
  loading: boolean;
  loadingProducts: boolean;
  loadingPacks: boolean;
  reload: () => Promise<void>;
  reloadProducts: () => Promise<void>;
  reloadPacks: () => Promise<void>;
  getCachedProduct: (id: string, productType?: ProductKind) => ProductRecord | null;
  cacheProduct: (product: ProductRecord) => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);
const CATALOG_CACHE_KEY = "atlas-products-cache-v1";

function getCacheKey(id: string, productType: ProductKind) {
  return `${productType}:${id}` as ProductCacheKey;
}

function readCatalogCache() {
  if (typeof window === "undefined") return {} as ProductCacheMap;

  try {
    const raw = window.sessionStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return {} as ProductCacheMap;

    const parsed = JSON.parse(raw) as Record<string, ProductRecord>;
    return parsed && typeof parsed === "object" ? (parsed as ProductCacheMap) : ({} as ProductCacheMap);
  } catch {
    return {} as ProductCacheMap;
  }
}

export function CatalogProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [packs, setPacks] = useState<ProductRecord[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [cache, setCache] = useState<ProductCacheMap>(() => readCatalogCache());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(cache));
  }, [cache]);

  const cacheProducts = useCallback((items: ProductRecord[]) => {
    if (!items.length) return;

    setCache((current) => {
      const next = { ...current };
      for (const item of items) {
        next[getCacheKey(item.id, item.productType)] = item;
      }
      return next;
    });
  }, []);

  const cacheProduct = useCallback((item: ProductRecord) => {
    setCache((current) => ({
      ...current,
      [getCacheKey(item.id, item.productType)]: item,
    }));
  }, []);

  const reloadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const nextProducts = await fetchPublicProductCards("product");
      setProducts(nextProducts);
      cacheProducts(nextProducts);
    } finally {
      setLoadingProducts(false);
    }
  }, [cacheProducts]);

  const reloadPacks = useCallback(async () => {
    setLoadingPacks(true);
    try {
      const nextPacks = await fetchPublicProductCards("pack");
      setPacks(nextPacks);
      cacheProducts(nextPacks);
    } finally {
      setLoadingPacks(false);
    }
  }, [cacheProducts]);

  const reload = useCallback(async () => {
    await reloadProducts();
  }, [reloadProducts]);

  useEffect(() => {
    void reloadProducts();
  }, [reloadProducts]);

  const getCachedProduct = useCallback(
    (id: string, productType: ProductKind = "product") => cache[getCacheKey(id, productType)] ?? null,
    [cache],
  );

  const value = useMemo(
    () => ({
      products,
      packs,
      loading: loadingProducts,
      loadingProducts,
      loadingPacks,
      reload,
      reloadProducts,
      reloadPacks,
      getCachedProduct,
      cacheProduct,
    }),
    [products, packs, loadingProducts, loadingPacks, reload, reloadProducts, reloadPacks, getCachedProduct, cacheProduct],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used inside CatalogProvider");
  return context;
}
