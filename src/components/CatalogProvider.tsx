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
import type { ProductRecord } from "@/types";
import { getCachedProductCollection, saveCachedProduct, saveCachedProducts } from "@/lib/public-product-cache";

interface CatalogContextValue {
  products: ProductRecord[];
  loading: boolean;
  reload: () => Promise<void>;
  cacheProduct: (product: ProductRecord) => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<ProductRecord[]>(() => getCachedProductCollection("product"));
  const [loading, setLoading] = useState(products.length === 0);

  const cacheProduct = useCallback((product: ProductRecord) => {
    saveCachedProduct(product);
  }, []);

  const reload = async () => {
    if (!products.length) setLoading(true);
    try {
      const nextProducts = await fetchPublicProductCards();
      setProducts(nextProducts);
      saveCachedProducts(nextProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const value = useMemo(() => ({ products, loading, reload, cacheProduct }), [cacheProduct, loading, products]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used inside CatalogProvider");
  return context;
}
