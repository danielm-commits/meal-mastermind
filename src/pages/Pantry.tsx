import { Plus, Search, Minus, CalendarClock } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import ShoppingListView from "@/components/ShoppingListView";
import StockBadge from "@/components/StockBadge";
import AddItemSheet, { ItemFormValues } from "@/components/AddItemSheet";
import ItemActionSheet from "@/components/ItemActionSheet";
import SwipeToDelete from "@/components/SwipeToDelete";
import { usePantry } from "@/context/PantryContext";
import { stockStatusConfig } from "@/lib/stockStatus";
import { PantryItem } from "@/data/mockData";

const getStep = (unit: string): number =>
  ['g', 'ml'].includes(unit) ? 50 : 1;

const categoryMap: Record<string, string> = {
  'Penne Pasta': 'Pantry staples',
  'Rice': 'Pantry staples',
  'Tomato Sauce': 'Pantry staples',
  'Olive Oil': 'Pantry staples',
  'Chicken Breast': 'Meat',
  'Ground Beef': 'Meat',
  'Salmon Fillet': 'Meat',
  'Mixed Greens': 'Produce',
  'Avocado': 'Produce',
  'Bananas': 'Produce',
  'Sourdough Bread': 'Bakery',
  'Greek Yogurt': 'Dairy',
};

const categoryOrder = ['Produce', 'Meat', 'Dairy', 'Bakery', 'Pantry staples', 'Other'];

const getCategory = (item: PantryItem) =>
  item.category || categoryMap[item.name] || 'Other';

const Pantry = () => {
  const { items, adjustQuantity, setQuantity, addItem, updateItem, deleteItem } = usePantry();
  const [tab, setTab] = useState<'stock' | 'shopping'>('stock');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Quantity flash: stores the id of the last item whose qty was just changed
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashItem = (id: string) => {
    setFlashId(null);
    requestAnimationFrame(() => setFlashId(id));
  };

  // Sheet state
  const [pantryAddOpen, setPantryAddOpen] = useState(false);
  const [shoppingAddOpen, setShoppingAddOpen] = useState(false);
  const [actionItem, setActionItem] = useState<PantryItem | null>(null);
  const [editItem, setEditItem] = useState<PantryItem | null>(null);

  // Long-press
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const startPress = (item: PantryItem) => {
    didLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setActionItem(item);
    }, 500);
  };

  const cancelPress = () => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = categoryOrder.reduce<Record<string, typeof items>>((acc, cat) => {
    const catItems = filtered.filter(i => getCategory(i) === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  const commitEdit = (id: string) => {
    if (didLongPress.current) return;
    const val = parseInt(editValue, 10);
    if (!isNaN(val) && val >= 0) setQuantity(id, val);
    setEditingId(null);
  };

  const handlePantryAddSubmit = (values: ItemFormValues) => {
    addItem({
      name: values.name.trim(),
      quantity: parseFloat(values.quantity) || 0,
      unit: values.unit,
      category: values.category,
      manual: true,
      lowThreshold: parseFloat(values.lowThreshold) || undefined,
    });
    setPantryAddOpen(false);
  };

  const handlePantryEditSubmit = (values: ItemFormValues) => {
    if (!editItem) return;
    updateItem(editItem.id, {
      name: values.name.trim(),
      quantity: parseFloat(values.quantity) || editItem.quantity,
      unit: values.unit,
      category: values.category,
      lowThreshold: parseFloat(values.lowThreshold) || undefined,
    });
    setEditItem(null);
  };

  const getInitialForEdit = (item: PantryItem): Partial<ItemFormValues> => ({
    name: item.name,
    quantity: String(item.quantity),
    unit: (item.unit as ItemFormValues['unit']) || 'pcs',
    category: (getCategory(item) as ItemFormValues['category']) || 'Other',
    lowThreshold: item.lowThreshold ? String(item.lowThreshold) : '',
  });

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <PageHeader
        title="Pantry"
        subtitle={tab === 'stock' ? `${items.length} items tracked` : 'Items needed for this week'}
      />

      {/* Segmented toggle */}
      <div className="px-5 mb-5">
        <div className="flex bg-secondary rounded-2xl p-1">
          <button
            onClick={() => setTab('stock')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
              tab === 'stock' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'
            }`}
          >
            Stock
          </button>
          <button
            onClick={() => setTab('shopping')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
              tab === 'shopping' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'
            }`}
          >
            Shopping list
          </button>
        </div>
      </div>

      {tab === 'shopping' ? (
        <div>
          <ShoppingListView
            addSheetOpen={shoppingAddOpen}
            onAddSheetClose={() => setShoppingAddOpen(false)}
          />
        </div>
      ) : (
        <div className="animate-fade-in">

          {/* Search */}
          <div className="px-5 mb-4">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                strokeWidth={1.5}
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search pantry..."
                className="w-full h-12 pl-11 pr-4 bg-card rounded-2xl text-sm font-light placeholder:text-muted-foreground focus:outline-none shadow-card"
              />
            </div>
          </div>

          {/* Items grouped by category */}
          <div className="px-5 space-y-6">
            {search && Object.keys(grouped).length === 0 && (
              <div className="flex flex-col items-center justify-center pt-12 text-center animate-fade-in">
                <p className="text-base font-semibold text-foreground">No items match "{search}"</p>
                <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
              </div>
            )}
            {Object.entries(grouped).map(([category, catItems], catIdx) => (
              <div
                key={category}
                className="animate-fade-in"
                style={{ animationDelay: `${catIdx * 0.05}s` }}
              >
                <h3 className="text-[12px] font-medium text-muted-foreground mb-3 tracking-[0.06em] uppercase">
                  {category}
                </h3>

                <div className="space-y-2">
                  {catItems.map(item => {
                    const cfg = stockStatusConfig[item.status];
                    const step = getStep(item.unit);
                    const isEditing = editingId === item.id;

                    return (
                      <SwipeToDelete
                        key={item.id}
                        onDelete={() => { deleteItem(item.id); toast.success('Removed from pantry'); }}
                        onSwipeStart={cancelPress}
                        className="shadow-card"
                      >
                        <div
                          onPointerDown={() => startPress(item)}
                          onPointerUp={cancelPress}
                          onPointerLeave={cancelPress}
                          onPointerCancel={cancelPress}
                          className="bg-card rounded-2xl"
                        >
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-foreground leading-tight">
                                {item.name}
                              </p>
                              {item.manual && (
                                <span className="text-[10px] font-medium text-muted-foreground/60 bg-secondary px-1.5 py-0.5 rounded-md leading-none">
                                  manual
                                </span>
                              )}
                            </div>
                            <StockBadge status={item.status} />
                          </div>

                          {item.neededFor && (
                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-3 text-xs font-medium ${cfg.neededBg} ${cfg.neededClass}`}
                            >
                              <CalendarClock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                              Needed for {item.neededFor}
                            </div>
                          )}

                          <div className="flex items-center justify-end mt-1">
                            <div className="flex items-center gap-2">
                              <button
                                onPointerDown={e => e.stopPropagation()}
                                onClick={() => { adjustQuantity(item.id, -step); flashItem(item.id); }}
                                className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center transition-transform active:scale-90"
                              >
                                <Minus className="w-4 h-4 text-foreground" strokeWidth={2} />
                              </button>

                              {isEditing ? (
                                <input
                                  autoFocus
                                  type="number"
                                  inputMode="numeric"
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  onBlur={() => commitEdit(item.id)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') commitEdit(item.id);
                                    if (e.key === 'Escape') setEditingId(null);
                                  }}
                                  className="w-[4.5rem] h-11 text-center text-base font-bold bg-secondary rounded-2xl focus:outline-none"
                                />
                              ) : (
                                <button
                                  onPointerDown={e => e.stopPropagation()}
                                  onClick={() => { setEditingId(item.id); setEditValue(String(item.quantity)); }}
                                  className="w-[4.5rem] h-11 flex items-center justify-center gap-0.5 rounded-2xl bg-secondary"
                                >
                                  <span className={`text-base font-bold text-foreground ${flashId === item.id ? 'animate-qty-flash' : ''}`}>{item.quantity}</span>
                                  <span className="text-xs text-muted-foreground">{item.unit}</span>
                                </button>
                              )}

                              <button
                                onPointerDown={e => e.stopPropagation()}
                                onClick={() => { adjustQuantity(item.id, step); flashItem(item.id); }}
                                className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center transition-transform active:scale-90"
                              >
                                <Plus className="w-4 h-4 text-foreground" strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                        </div>
                        </div>
                      </SwipeToDelete>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => tab === 'stock' ? setPantryAddOpen(true) : setShoppingAddOpen(true)}
        className="fixed right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40 transition-transform active:scale-95 bg-primary"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
        aria-label={tab === 'stock' ? 'Add pantry item' : 'Add to shopping list'}
      >
        <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={2} />
      </button>

      {/* Pantry add sheet */}
      <AddItemSheet
        mode="pantry"
        open={pantryAddOpen}
        onClose={() => setPantryAddOpen(false)}
        onSubmit={handlePantryAddSubmit}
      />

      {/* Pantry edit sheet */}
      <AddItemSheet
        mode="pantry"
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={handlePantryEditSubmit}
        initial={editItem ? getInitialForEdit(editItem) : undefined}
      />

      {/* Long-press action sheet */}
      <ItemActionSheet
        open={!!actionItem}
        onClose={() => setActionItem(null)}
        itemName={actionItem?.name ?? ''}
        onEdit={() => { if (actionItem) setEditItem(actionItem); }}
        onDelete={() => { if (actionItem) { deleteItem(actionItem.id); toast.success('Removed from pantry'); } }}
      />
    </div>
  );
};

export default Pantry;
