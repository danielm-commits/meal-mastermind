import { createContext, useContext, useState, ReactNode } from "react";
import { shoppingList as initialShoppingList, ShoppingItem } from "@/data/mockData";

const STORAGE_KEY = 'shopping-list-items';

function load(): ShoppingItem[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : initialShoppingList;
  } catch {
    return initialShoppingList;
  }
}

interface ShoppingContextType {
  items: ShoppingItem[];
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  addItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
  deleteItem: (id: string) => void;
}

const ShoppingContext = createContext<ShoppingContextType | null>(null);

export const ShoppingProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ShoppingItem[]>(load);

  const persist = (next: ShoppingItem[]) => {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const updateItem = (id: string, updates: Partial<ShoppingItem>) =>
    persist(items.map(i => i.id === id ? { ...i, ...updates } : i));

  const addItem = (item: Omit<ShoppingItem, 'id' | 'checked'>) =>
    persist([...items, { ...item, id: `m-${Date.now()}`, checked: false }]);

  const deleteItem = (id: string) =>
    persist(items.filter(i => i.id !== id));

  return (
    <ShoppingContext.Provider value={{ items, updateItem, addItem, deleteItem }}>
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => {
  const ctx = useContext(ShoppingContext);
  if (!ctx) throw new Error("useShopping must be used within a ShoppingProvider");
  return ctx;
};
