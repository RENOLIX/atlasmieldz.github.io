import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { fetchPublicProducts } from "@/lib/supabase";
import type { ProductRecord } from "@/types";
import { readCachedProducts, saveCachedProducts } from "@/lib/public-product-db";

interface CatalogContextValue {
  products: ProductRecord[];
  packs: ProductRecord[];
  loading: boolean;
  loadingProducts: boolean;
  loadingPacks: boolean;
  reload: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [packs, setPacks] = useState<ProductRecord[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPacks, setLoadingPacks] = useState(true);

  const reload = useCallback(async (foreground = false) => {
    if (foreground) {
      setLoadingProducts(true);
      setLoadingPacks(true);
    }

    try {
      const [nextProducts, nextPacks] = await Promise.all([
        fetchPublicProducts("product"),
        fetchPublicProducts("pack"),
      ]);

      setProducts(nextProducts.filter((item) => item.active));
      setPacks(nextPacks.filter((item) => item.active));
      await Promise.all([saveCachedProducts(nextProducts), saveCachedProducts(nextPacks)]);
    } finally {
      setLoadingProducts(false);
      setLoadingPacks(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([readCachedProducts("product"), readCachedProducts("pack")])
      .then(([cachedProducts, cachedPacks]) => {
        if (cancelled) return;
        if (cachedProducts.length) setProducts(cachedProducts.filter((item) => item.active));
        if (cachedPacks.length) setPacks(cachedPacks.filter((item) => item.active));
      })
      .catch(() => undefined)
      .finally(() => {
        if (cancelled) return;
        setLoadingProducts(false);
        setLoadingPacks(false);
        void reload(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reload]);

  const value = useMemo(
    () => ({
      products,
      packs,
      loading: loadingProducts || loadingPacks,
      loadingProducts,
      loadingPacks,
      reload,
    }),
    [loadingPacks, loadingProducts, packs, products],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used inside CatalogProvider");
  return context;
}
