export type StockStatus = 'ok' | 'low' | 'critical';

export const stockStatusConfig: Record<StockStatus, {
  label: string;
  borderColor: string;
  neededClass: string;
  neededBg: string;
}> = {
  ok: {
    label: 'In stock',
    borderColor: 'border-l-[#2B4C7E]',
    neededClass: 'text-muted-foreground',
    neededBg: 'bg-secondary',
  },
  low: {
    label: 'Running low',
    borderColor: 'border-l-[#D4A85A]',
    neededClass: 'text-[#9A7A3A]',
    neededBg: 'bg-[#FDF3E0]',
  },
  critical: {
    label: 'Out of stock',
    borderColor: 'border-l-[#C97B63]',
    neededClass: 'text-[#C97B63]',
    neededBg: 'bg-[#FAEAE5]',
  },
};

/** Unit-aware threshold for deriving status from a raw quantity */
export const deriveStatus = (qty: number, unit: string): StockStatus => {
  if (qty === 0) return 'critical';
  const lowThreshold = ['g', 'ml'].includes(unit) ? 100 : 2;
  return qty <= lowThreshold ? 'low' : 'ok';
};
