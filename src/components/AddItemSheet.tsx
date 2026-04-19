import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

type Unit = 'g' | 'kg' | 'ml' | 'l' | 'pcs';
type Category = 'Produce' | 'Meat' | 'Dairy' | 'Bakery' | 'Pantry' | 'Other';

export const ITEM_UNITS: Unit[] = ['g', 'kg', 'ml', 'l', 'pcs'];
export const ITEM_CATEGORIES: Category[] = ['Produce', 'Meat', 'Dairy', 'Bakery', 'Pantry', 'Other'];

export interface ItemFormValues {
  name: string;
  quantity: string;
  unit: Unit;
  category: Category;
  estimatedCost: string;
  lowThreshold: string;
}

const EMPTY: ItemFormValues = {
  name: '', quantity: '', unit: 'g', category: 'Produce', estimatedCost: '', lowThreshold: '',
};

interface AddItemSheetProps {
  mode: 'shopping' | 'pantry';
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ItemFormValues) => void;
  initial?: Partial<ItemFormValues>;
}

const AddItemSheet = ({ mode, open, onClose, onSubmit, initial }: AddItemSheetProps) => {
  const [values, setValues] = useState<ItemFormValues>({ ...EMPTY });
  const [errors, setErrors] = useState<{ name?: string; quantity?: string }>({});
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValues({ ...EMPTY, ...initial });
      setErrors({});
      const t = setTimeout(() => nameRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  const set = <K extends keyof ItemFormValues>(key: K, val: ItemFormValues[K]) => {
    setValues(v => ({ ...v, [key]: val }));
    if (key === 'name' || key === 'quantity') setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: { name?: string; quantity?: string } = {};
    if (!values.name.trim()) errs.name = 'Item name is required';
    const qty = parseFloat(values.quantity);
    if (!values.quantity || isNaN(qty) || qty <= 0) errs.quantity = 'Enter a valid quantity';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(values);
      onClose();
      if (!isEditing) {
        toast.success(mode === 'shopping' ? 'Added to list' : 'Added to pantry');
      }
    }
  };

  const isEditing = !!initial?.name;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end pb-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-background rounded-3xl shadow-2xl px-5 pt-4 pb-6 max-w-lg w-full mx-auto"
        style={{ animation: 'slide-up 0.25s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="w-10 h-1 bg-secondary rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit item' : mode === 'shopping' ? 'Add to shopping list' : 'Add to pantry'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Name */}
          <div>
            <input
              ref={nameRef}
              value={values.name}
              onChange={e => set('name', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Item name"
              className={`w-full h-12 px-4 bg-card rounded-2xl text-sm placeholder:text-muted-foreground/60 focus:outline-none shadow-card ${errors.name ? 'ring-2 ring-destructive/30' : ''}`}
            />
            {errors.name && <p className="text-xs text-destructive mt-1.5 ml-1">{errors.name}</p>}
          </div>

          {/* Quantity + unit */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={values.quantity}
                onChange={e => set('quantity', e.target.value)}
                placeholder="Quantity"
                className={`w-full h-12 px-4 bg-card rounded-2xl text-sm placeholder:text-muted-foreground/60 focus:outline-none shadow-card ${errors.quantity ? 'ring-2 ring-destructive/30' : ''}`}
              />
              {errors.quantity && <p className="text-xs text-destructive mt-1.5 ml-1">{errors.quantity}</p>}
            </div>
            <select
              value={values.unit}
              onChange={e => set('unit', e.target.value as Unit)}
              className="h-12 px-3 bg-card rounded-2xl text-sm font-medium focus:outline-none shadow-card min-w-[76px]"
            >
              {ITEM_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* Category */}
          <select
            value={values.category}
            onChange={e => set('category', e.target.value as Category)}
            className="w-full h-12 px-4 bg-card rounded-2xl text-sm font-medium focus:outline-none shadow-card"
          >
            {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Low threshold (pantry only) */}
          {mode === 'pantry' && (
            <div>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={values.lowThreshold}
                onChange={e => set('lowThreshold', e.target.value)}
                placeholder="Low stock alert threshold (optional)"
                className="w-full h-12 px-4 bg-card rounded-2xl text-sm placeholder:text-muted-foreground/60 focus:outline-none shadow-card"
              />
              <p className="text-xs text-muted-foreground mt-1.5 ml-1">Alert me when below this amount</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full h-12 bg-primary rounded-2xl text-sm font-semibold text-primary-foreground mt-1"
          >
            {isEditing ? 'Save changes' : mode === 'shopping' ? 'Add to list' : 'Add to pantry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemSheet;
