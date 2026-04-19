import { createContext, useContext, useState, ReactNode } from "react";
import { pantryItems as initialPantryItems, PantryItem } from "@/data/mockData";
import { deriveStatus, StockStatus } from "@/lib/stockStatus";

const STORAGE_KEY = 'pantry-items';

function load(): PantryItem[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [...initialPantryItems].sort((a, b) => {
    const order = { critical: 0, low: 1, ok: 2 };
    return order[a.status] - order[b.status];
  });
}

interface PantryContextType {
  items: PantryItem[];
  adjustQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, qty: number) => void;
  addItem: (item: Omit<PantryItem, 'id' | 'status'>) => void;
  updateItem: (id: string, updates: Partial<Omit<PantryItem, 'id' | 'status'>>) => void;
  deleteItem: (id: string) => void;
  getStatusByName: (name: string) => StockStatus | undefined;
  addQuantityByName: (name: string, qty: number) => boolean;
  subtractQuantityByName: (name: string, qty: number) => boolean;
}

const PantryContext = createContext<PantryContextType | null>(null);

export const PantryProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<PantryItem[]>(load);

  const persist = (next: PantryItem[]) => {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const adjustQuantity = (id: string, delta: number) => {
    persist(items.map(item => {
      if (item.id !== id) return item;
      const newQty = Math.max(0, item.quantity + delta);
      return { ...item, quantity: newQty, status: deriveStatus(newQty, item.unit) };
    }));
  };

  const setQuantity = (id: string, qty: number) => {
    persist(items.map(item => {
      if (item.id !== id) return item;
      return { ...item, quantity: qty, status: deriveStatus(qty, item.unit) };
    }));
  };

  const addItem = (item: Omit<PantryItem, 'id' | 'status'>) => {
    const newItem: PantryItem = {
      ...item,
      id: `m-${Date.now()}`,
      status: deriveStatus(item.quantity, item.unit),
      manual: true,
    };
    persist([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<Omit<PantryItem, 'id' | 'status'>>) => {
    persist(items.map(item => {
      if (item.id !== id) return item;
      const qty = updates.quantity ?? item.quantity;
      const unit = updates.unit ?? item.unit;
      return { ...item, ...updates, status: deriveStatus(qty, unit) };
    }));
  };

  const deleteItem = (id: string) => persist(items.filter(i => i.id !== id));

  const getStatusByName = (name: string): StockStatus | undefined =>
    items.find(i => i.name.toLowerCase() === name.toLowerCase())?.status as StockStatus | undefined;

  const addQuantityByName = (name: string, qty: number): boolean => {
    const match = items.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (!match) return false;
    persist(items.map(item => {
      if (item.id !== match.id) return item;
      const newQty = item.quantity + qty;
      return { ...item, quantity: newQty, status: deriveStatus(newQty, item.unit) };
    }));
    return true;
  };

  const subtractQuantityByName = (name: string, qty: number): boolean => {
    const match = items.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (!match) return false;
    persist(items.map(item => {
      if (item.id !== match.id) return item;
      const newQty = Math.max(0, item.quantity - qty);
      return { ...item, quantity: newQty, status: deriveStatus(newQty, item.unit) };
    }));
    return true;
  };

  return (
    <PantryContext.Provider value={{
      items,
      adjustQuantity,
      setQuantity,
      addItem,
      updateItem,
      deleteItem,
      getStatusByName,
      addQuantityByName,
      subtractQuantityByName,
    }}>
      {children}
    </PantryContext.Provider>
  );
};

export const usePantry = () => {
  const ctx = useContext(PantryContext);
  if (!ctx) throw new Error("usePantry must be used within a PantryProvider");
  return ctx;
};
