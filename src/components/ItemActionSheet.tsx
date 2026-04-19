import { useState } from "react";
import { Pencil, Trash2, Package } from "lucide-react";

interface ItemActionSheetProps {
  open: boolean;
  onClose: () => void;
  itemName: string;
  onEdit: () => void;
  onDelete: () => void;
  onMoveToPantry?: () => void;
}

const ItemActionSheet = ({ open, onClose, itemName, onEdit, onDelete, onMoveToPantry }: ItemActionSheetProps) => {
  const [confirming, setConfirming] = useState(false);

  if (!open) return null;

  const handleClose = () => { setConfirming(false); onClose(); };

  const handleDelete = () => { setConfirming(false); onDelete(); onClose(); };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div
        className="relative bg-background rounded-t-3xl shadow-2xl px-5 pt-4 pb-10 max-w-lg w-full mx-auto"
        style={{ animation: 'slide-up 0.2s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="w-10 h-1 bg-secondary rounded-full mx-auto mb-4" />

        {confirming ? (
          <div className="py-2">
            <p className="text-base font-semibold text-foreground text-center mb-1">Remove item?</p>
            <p className="text-sm text-muted-foreground text-center mb-6 truncate px-4">"{itemName}"</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 h-12 bg-secondary rounded-2xl text-sm font-medium text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-12 bg-destructive rounded-2xl text-sm font-semibold text-white"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground tracking-wide text-center mb-4 uppercase truncate px-4">
              {itemName}
            </p>
            <button
              onClick={() => { onEdit(); handleClose(); }}
              className="w-full flex items-center gap-3 h-14 px-4 bg-card rounded-2xl shadow-card text-sm font-medium text-foreground"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              Edit
            </button>
            {onMoveToPantry && (
              <button
                onClick={() => { onMoveToPantry(); handleClose(); }}
                className="w-full flex items-center gap-3 h-14 px-4 bg-card rounded-2xl shadow-card text-sm font-medium text-foreground"
              >
                <Package className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                Move to Pantry
              </button>
            )}
            <button
              onClick={() => setConfirming(true)}
              className="w-full flex items-center gap-3 h-14 px-4 bg-card rounded-2xl shadow-card text-sm font-medium text-destructive"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemActionSheet;
