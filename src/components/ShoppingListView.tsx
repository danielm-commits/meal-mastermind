import { useState, useRef } from "react";
import { Check, Share2, Copy } from "lucide-react";
import { toast } from "sonner";
import { ShoppingItem } from "@/data/mockData";
import { usePantry } from "@/context/PantryContext";
import { useShopping } from "@/context/ShoppingContext";
import StockBadge from "@/components/StockBadge";
import ItemActionSheet from "@/components/ItemActionSheet";
import AddItemSheet, { ItemFormValues } from "@/components/AddItemSheet";
import SwipeToDelete from "@/components/SwipeToDelete";

const parseAmount = (amount: string): number | null => {
  const match = amount.match(/^(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

interface ShoppingListViewProps {
  addSheetOpen?: boolean;
  onAddSheetClose?: () => void;
}

const ShoppingListView = ({ addSheetOpen = false, onAddSheetClose }: ShoppingListViewProps) => {
  const { getStatusByName, addQuantityByName, subtractQuantityByName, addItem: addToPantry } = usePantry();
  const { items, updateItem, addItem, deleteItem } = useShopping();

  const [copied, setCopied] = useState(false);
  const [actionItem, setActionItem] = useState<ShoppingItem | null>(null);
  const [editItem, setEditItem] = useState<ShoppingItem | null>(null);

  // Long-press
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const startPress = (item: ShoppingItem) => {
    didLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setActionItem(item);
    }, 500);
  };

  const cancelPress = () => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; }
  };

  const toggle = (id: string) => {
    if (didLongPress.current) return;
    const item = items.find(i => i.id === id);
    if (!item) return;

    const qty = parseAmount(item.amount);
    const willBeChecked = !item.checked;

    if (qty !== null) {
      if (willBeChecked) {
        const added = addQuantityByName(item.name, qty);
        if (added) toast.success(`Added ${item.amount} of ${item.name} to pantry`);
      } else {
        subtractQuantityByName(item.name, qty);
      }
    }
    updateItem(id, { checked: willBeChecked });
  };

  const handleMoveToPantry = (item: ShoppingItem) => {
    const qty = parseAmount(item.amount);
    if (qty !== null) {
      const added = addQuantityByName(item.name, qty);
      if (!added) addToPantry({ name: item.name, quantity: qty, unit: 'pcs', manual: true });
      toast.success(`${item.name} moved to pantry`);
    }
    updateItem(item.id, { checked: true });
  };

  const handleAddSubmit = (values: ItemFormValues) => {
    addItem({
      name: values.name.trim(),
      amount: `${values.quantity}${values.unit}`,
      estimatedCost: 0,
      category: values.category,
      manual: true,
    });
    onAddSheetClose?.();
  };

  const handleEditSubmit = (values: ItemFormValues) => {
    if (!editItem) return;
    updateItem(editItem.id, {
      name: values.name.trim(),
      amount: `${values.quantity}${values.unit}`,
      category: values.category,
    });
    setEditItem(null);
  };

  const getInitialForEdit = (item: ShoppingItem): Partial<ItemFormValues> => {
    const qtyMatch = item.amount.match(/^(\d+(?:\.\d+)?)(g|kg|ml|l|pcs)?/);
    return {
      name: item.name,
      quantity: qtyMatch ? qtyMatch[1] : '',
      unit: (qtyMatch?.[2] as ItemFormValues['unit']) || 'pcs',
      category: (item.category as ItemFormValues['category']) || 'Other',
    };
  };

  const categories = [...new Set(items.map(i => i.category))];

  const getPlainText = () =>
    categories.map(cat => {
      const catItems = items.filter(i => i.category === cat && !i.checked);
      if (catItems.length === 0) return '';
      return `${cat}:\n${catItems.map(i => `  - ${i.name} — ${i.amount}`).join('\n')}`;
    }).filter(Boolean).join('\n\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = getPlainText();
    if (navigator.share) {
      await navigator.share({ title: 'Shopping List', text });
    } else {
      handleCopy();
    }
  };

  return (
    <>
      {/* Share / Copy */}
      <div className="px-5 flex gap-2.5 mb-5">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 h-11 bg-card border border-secondary rounded-full text-sm font-medium text-foreground shadow-card"
        >
          <Share2 className="w-4 h-4" strokeWidth={1.5} /> Share
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 h-11 bg-card border border-secondary rounded-full text-sm font-medium text-foreground shadow-card"
        >
          <Copy className="w-4 h-4" strokeWidth={1.5} /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-16 text-center px-5 animate-fade-in">
          <p className="text-2xl mb-3">🛒</p>
          <p className="text-base font-semibold text-foreground">You're all set!</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Your shopping list is empty</p>
        </div>
      )}

      {/* Items by category */}
      <div className="px-5 space-y-5">
        {categories.map((cat, catIdx) => {
          const catItems = items.filter(i => i.category === cat);
          return (
            <div key={cat} style={{ animationDelay: `${catIdx * 0.05}s` }}>
              <h3 className="text-[12px] font-medium text-muted-foreground mb-3 tracking-[0.06em] uppercase">{cat}</h3>
              <div className="space-y-2">
                {catItems.map(item => {
                  const pantryStatus = getStatusByName(item.name);
                  const showBadge = pantryStatus && pantryStatus !== 'ok' && !item.checked;
                  return (
                    <SwipeToDelete
                      key={item.id}
                      onDelete={() => { deleteItem(item.id); toast.success('Removed from list'); }}
                      onSwipeStart={cancelPress}
                      className="shadow-card"
                    >
                      <button
                        onClick={() => toggle(item.id)}
                        onPointerDown={() => startPress(item)}
                        onPointerUp={cancelPress}
                        onPointerLeave={cancelPress}
                        onPointerCancel={cancelPress}
                        className={`w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all ${
                          item.checked ? 'bg-card opacity-50' : 'bg-card'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
                          item.checked ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                        }`}>
                          {item.checked && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={2.5} />}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-medium ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.name}
                            </p>
                            {showBadge && <StockBadge status={pantryStatus} />}
                            {item.manual && (
                              <span className="text-[10px] font-medium text-muted-foreground/60 bg-secondary px-1.5 py-0.5 rounded-md leading-none">
                                manual
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-light">{item.amount}</p>
                        </div>
                      </button>
                    </SwipeToDelete>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Long-press action sheet */}
      <ItemActionSheet
        open={!!actionItem}
        onClose={() => setActionItem(null)}
        itemName={actionItem?.name ?? ''}
        onEdit={() => { if (actionItem) setEditItem(actionItem); }}
        onDelete={() => { if (actionItem) { deleteItem(actionItem.id); toast.success('Removed from list'); } }}
        onMoveToPantry={() => { if (actionItem) handleMoveToPantry(actionItem); }}
      />

      {/* Edit sheet */}
      <AddItemSheet
        mode="shopping"
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={handleEditSubmit}
        initial={editItem ? getInitialForEdit(editItem) : undefined}
      />

      {/* Add sheet — opened by FAB in Pantry.tsx */}
      <AddItemSheet
        mode="shopping"
        open={addSheetOpen}
        onClose={() => onAddSheetClose?.()}
        onSubmit={handleAddSubmit}
      />
    </>
  );
};

export default ShoppingListView;
