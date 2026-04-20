import { useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronRight, ShoppingCart } from "lucide-react";
import { getRecipeById } from "@/data/mockData";
import { useProfile } from "@/context/ProfileContext";
import { usePantry } from "@/context/PantryContext";
import { useMealPlan } from "@/context/MealPlanContext";

const MAX_VISIBLE_ALERTS = 3;

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { items: pantryItems } = usePantry();
  const { mealPlan } = useMealPlan();

  const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Mon=1…Sat=6, Sun=7 so Sunday doesn't undercut Monday
  const DAY_ORDER: Record<string, number> = {
    monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
    friday: 5, saturday: 6, sunday: 7,
  };

  const jsDay = new Date().getDay(); // 0=Sun…6=Sat
  // On Sunday the new week is about to begin, so show all upcoming alerts (order 0 means everything passes)
  const todayOrder = jsDay === 0 ? 0 : jsDay;
  const today = DAY_KEYS[jsDay];
  const todayPlan = mealPlan[today] ?? mealPlan['Mon'] ?? { breakfast: '', lunch: '', dinner: '' };
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Only surface alerts for items needed for today or a future day this week
  const isFutureOrToday = (neededFor?: string) => {
    if (!neededFor) return false;
    const dayName = neededFor.split("'")[0].toLowerCase();
    const order = DAY_ORDER[dayName];
    return order !== undefined && order >= todayOrder;
  };

  const allAlerts = pantryItems
    .filter(i => (i.status === 'critical' || i.status === 'low') && isFutureOrToday(i.neededFor))
    .sort((a, b) => (a.status === 'critical' ? 0 : 1) - (b.status === 'critical' ? 0 : 1));
  const visibleAlerts = allAlerts.slice(0, MAX_VISIBLE_ALERTS);
  const hiddenCount = allAlerts.length - visibleAlerts.length;

  const initials = profile.name
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const todayMeals = (['breakfast', 'lunch', 'dinner'] as const).map(slot => ({
    slot,
    recipe: getRecipeById(todayPlan[slot]),
  }));

  return (
    <div className="pb-24 max-w-lg mx-auto">

      {/* Header with avatar */}
      <div className="flex items-start justify-between px-5 pt-10 pb-2">
        <div className="animate-fade-in">
          <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">{todayDate}</p>
          <h1 className="font-serif text-[34px] font-semibold tracking-tight text-foreground leading-tight mt-2">
            Hey, {profile.name.split(' ')[0]}
          </h1>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-card shrink-0 mt-1"
        >
          <span className="text-sm font-semibold text-primary-foreground">{initials}</span>
        </button>
      </div>

      {/* 2 — Today's meals */}
      <div className="mx-5 mb-6 mt-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-serif text-xl font-semibold tracking-tight">Today's meals</h2>
          <button onClick={() => navigate('/planner')} className="text-sm font-medium text-primary">Full week →</button>
        </div>
        {todayMeals.every(({ recipe }) => !recipe) ? (
          <div className="bg-card rounded-2xl shadow-card px-5 py-6 flex flex-col items-center text-center">
            <p className="text-sm font-medium text-foreground">Nothing planned today</p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Head to the planner to set up your meals</p>
            <button
              onClick={() => navigate('/planner')}
              className="h-9 px-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
            >
              Go to Planner
            </button>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-card divide-y divide-secondary">
            {todayMeals.map(({ slot, recipe }) => (
              <button
                key={slot}
                onClick={() => navigate('/planner')}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left"
              >
                <span className="text-xs text-muted-foreground capitalize w-20">{slot}</span>
                <span className="flex-1 text-sm font-medium text-foreground">{recipe?.name ?? '—'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3 — Stock alerts (max 3) */}
      {visibleAlerts.length > 0 && (
        <div className="mx-5 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-serif text-xl font-semibold tracking-tight mb-3">Running low</h2>
          {visibleAlerts.map(item => {
            const isCritical = item.status === 'critical';
            return (
              <button
                key={item.id}
                onClick={() => navigate('/pantry')}
                className="w-full flex items-center gap-3 p-4 mb-2 bg-card rounded-2xl text-left shadow-card"
              >
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 ${isCritical ? 'text-[#C97B63]' : 'text-[#D4A85A]'}`}
                  strokeWidth={1.5}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {isCritical ? `Out of ${item.name}` : `Running low on ${item.name}`}
                  </p>
                  {item.neededFor && (
                    <p className="text-xs text-muted-foreground mt-0.5">Needed for {item.neededFor}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
              </button>
            );
          })}
          {hiddenCount > 0 && (
            <button
              onClick={() => navigate('/pantry')}
              className="text-sm font-medium text-primary mt-1 px-1"
            >
              See all alerts ({hiddenCount} more)
            </button>
          )}
        </div>
      )}

      {/* 4 — Shopping list CTA */}
      <div className="mx-5 mb-5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <button
          onClick={() => navigate('/pantry')}
          className="w-full flex items-center justify-center gap-2 h-14 bg-primary rounded-2xl shadow-card transition-transform active:scale-[0.98]"
        >
          <ShoppingCart className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-primary-foreground tracking-wide">View shopping list</span>
        </button>
      </div>

    </div>
  );
};

export default Dashboard;
