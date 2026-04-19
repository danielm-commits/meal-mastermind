import { Home, CalendarDays, BookOpen } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePantry } from "@/context/PantryContext";

// Simple pantry/shelf icon (line art, same weight as others)
const PantryIcon = ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth ?? 1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="2" width="18" height="20" rx="1.5" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="9" y1="11" x2="11" y2="11" />
    <line x1="13" y1="11" x2="15" y2="11" />
  </svg>
);

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/planner', icon: CalendarDays, label: 'Planner' },
  { path: '/pantry', icon: PantryIcon, label: 'Pantry' },
  { path: '/recipes', icon: BookOpen, label: 'Recipes' },
];

const SUB_PAGES = ['/nutrition', '/profile'];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = usePantry();
  const alertCount = items.filter(i => i.status !== 'ok').length;

  if (SUB_PAGES.includes(location.pathname)) return null;

  return (
    <nav className="shrink-0 bg-card border-t border-border safe-bottom" style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          const showBadge = path === '/' && alertCount > 0;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 transition-colors"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                  strokeWidth={active ? 2 : 1.5}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
