import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  label?: string;
  to?: string; // optional override — defaults to navigate(-1)
  onClick?: () => void; // optional handler — skips router navigation
}

const BackButton = ({ label, to, onClick }: BackButtonProps) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        if (onClick) { onClick(); return; }
        to ? navigate(to) : navigate(-1);
      }}
      className="flex items-center gap-1 text-primary"
      aria-label="Go back"
    >
      <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
};

export default BackButton;
