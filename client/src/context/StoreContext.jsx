import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SITE_DEFAULTS, STORAGE_KEYS } from '../config/site';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { variantKey } from '../utils/stock';
import { useToast } from './ToastContext';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState(() => {
    const loaded = storage.load(STORAGE_KEYS.settings, {});
    if (!loaded.whatsappNumber || loaded.whatsappNumber === '919999999999') {
      loaded.whatsappNumber = SITE_DEFAULTS.whatsappNumber;
    }
    if (!loaded.email || loaded.email === 'hello@noolz.example') {
      loaded.email = SITE_DEFAULTS.email;
    }
    if (!loaded.instagram || loaded.instagram.includes('noolz.official')) {
      loaded.instagram = SITE_DEFAULTS.instagram;
    }
    if (!loaded.address || loaded.address.includes('Weavers Lane')) {
      loaded.address = SITE_DEFAULTS.address;
    }
    return {
      ...SITE_DEFAULTS,
      ...loaded,
    };
  });
  const [loading, setLoading] = useState(true);

  const productsRef = useRef(products);
  const historyRef = useRef(history);
  productsRef.current = products;
  historyRef.current = history;

  // Fetch initial data from backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, histRes] = await Promise.allSettled([
        api.products.getAll(),
        api.stock.getHistory({ limit: 200 }),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.success) {
        setProducts(prodRes.value.products || []);
      }

      if (histRes.status === 'fulfilled' && histRes.value.success) {
        setHistory(histRes.value.history || []);
      }
    } catch (err) {
      console.error('[StoreContext] Failed to load data from backend:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Persist settings locally
  useEffect(() => {
    storage.save(STORAGE_KEYS.settings, settings);
  }, [settings]);

  const getProduct = useCallback(
    (id) => productsRef.current.find((p) => p.id === id || p._id === id),
    []
  );

  const addProduct = useCallback(
    async (data) => {
      try {
        const res = await api.products.create(data);
        if (res.success && res.product) {
          setProducts((list) => [res.product, ...list]);
          // Refresh stock history in background to show initial stock entries
          api.stock.getHistory({ limit: 200 }).then((hRes) => {
            if (hRes.success) setHistory(hRes.history);
          });
          return res.product;
        }
      } catch (err) {
        toast(err.message || 'Failed to save product on server', 'error');
        throw err;
      }
    },
    [toast]
  );

  const updateProduct = useCallback(
    async (id, data) => {
      try {
        const res = await api.products.update(id, data);
        if (res.success && res.product) {
          setProducts((list) =>
            list.map((p) => (p.id === id || p._id === id ? res.product : p))
          );
          // Refresh stock history
          api.stock.getHistory({ limit: 200 }).then((hRes) => {
            if (hRes.success) setHistory(hRes.history);
          });
          return res.product;
        }
      } catch (err) {
        toast(err.message || 'Failed to update product on server', 'error');
        throw err;
      }
    },
    [toast]
  );

  const deleteProduct = useCallback(
    async (id) => {
      try {
        await api.products.delete(id);
        setProducts((list) => list.filter((p) => p.id !== id && p._id !== id));
        setHistory((list) => list.filter((h) => h.productId !== id));
      } catch (err) {
        toast(err.message || 'Failed to delete product on server', 'error');
        throw err;
      }
    },
    [toast]
  );

  const setVariantStock = useCallback(
    async (productId, color, size, qty, note = 'Manual adjustment') => {
      // Optimistic UI update
      const key = variantKey(color, size);
      const product = productsRef.current.find(
        (p) => p.id === productId || p._id === productId
      );
      if (!product) return;

      const previous = product.stock?.[key] ?? 0;
      const updated = Math.max(0, Math.floor(Number(qty) || 0));
      if (previous === updated) return;

      setProducts((list) =>
        list.map((p) =>
          p.id === productId || p._id === productId
            ? { ...p, stock: { ...p.stock, [key]: updated } }
            : p
        )
      );

      try {
        const res = await api.stock.updateVariant(productId, {
          color,
          size,
          quantity: updated,
          note,
        });

        if (res.historyEntry) {
          setHistory((h) => [res.historyEntry, ...h]);
        }
      } catch (err) {
        // Rollback on failure
        setProducts((list) =>
          list.map((p) =>
            p.id === productId || p._id === productId
              ? { ...p, stock: { ...p.stock, [key]: previous } }
              : p
          )
        );
        toast('Failed to update stock on server', 'error');
      }
    },
    [toast]
  );

  const updateSettings = useCallback((patch) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const resetData = useCallback(async () => {
    setSettings({ ...SITE_DEFAULTS });
    await fetchData();
  }, [fetchData]);

  const value = useMemo(
    () => ({
      products,
      history,
      settings,
      loading,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      setVariantStock,
      updateSettings,
      resetData,
      refreshData: fetchData,
    }),
    [
      products,
      history,
      settings,
      loading,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      setVariantStock,
      updateSettings,
      resetData,
      fetchData,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
