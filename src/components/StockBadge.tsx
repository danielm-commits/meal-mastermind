import { StockStatus } from "@/lib/stockStatus";

interface StockBadgeProps {
  status: StockStatus;
}

// Styles mapped directly — no icon, text-only pill
const badgeStyles: Record<StockStatus, { label: string; className: string } | null> = {
  ok: null, // "In stock" shows no badge — only flag problem states
  low: { label: 'Running low', className: 'bg-[#D4A85A] text-white' },
  critical: { label: 'Out of stock', className: 'bg-[#C97B63] text-white' },
};

const StockBadge = ({ status }: StockBadgeProps) => {
  const style = badgeStyles[status];
  if (!style) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${style.className}`}>
      {style.label}
    </span>
  );
};

export default StockBadge;
