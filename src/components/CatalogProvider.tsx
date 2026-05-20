import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { fetchPublicProductCards } from "@/lib/supabase";
import type { ProductRecord } from "@/types";

interface CatalogContextValue {
  products: ProductRecord[];
  loading: boolean;
  reload: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const nextProducts = await fetchPublicProductCards();
      setProducts(nextProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const value = useMemo(() => ({ products, loading, reload }), [loading, products]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used inside CatalogProvider");
  return context;
}
