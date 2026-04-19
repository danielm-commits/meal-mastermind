import { useState, useRef } from "react";
import { Plus, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import SwipeToDelete from "@/components/SwipeToDelete";
import { weekDays, fullWeekDays, getRecipeById, recipes, MealSlot } from "@/data/mockData";
import { useMealPlan } from "@/context/MealPlanContext";

const mealSlots: MealSlot[] = ['breakfast', 'lunch', 'dinner'];

// ─── Recipe Picker Sheet ─────────────────────────────────────────────────────

const RecipePicker = ({
  slot,
  onSelect,
  onClose,
}: {
  slot: MealSlot;
  onSelect: (recipeId: string) => void;
  onClose: () => void;
}) => {
  const [search, setSearch] = useState('');
  const filtered = recipes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end pb-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-background rounded-3xl shadow-2xl max-w-lg w-full mx-auto flex flex-col"
        style={{ animation: 'slide-up 0.25s cubic-bezier(0.16,1,0.3,1)', maxHeight: '80vh' }}
      >
        {/* Handle + header */}
        <div className="px-5 pt-4 pb-3 shrink-0">
          <div className="w-10 h-1 bg-secondary rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold capitalize">Add {slot}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search recipes..."
              className="w-full h-11 pl-10 pr-4 bg-secondary rounded-2xl text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Recipe list */}
        <div className="overflow-y-auto px-5 pb-5 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recipes match "{search}"</p>
          ) : (
            filtered.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => { onSelect(recipe.id); onClose(); }}
                className="w-full flex items-center gap-3.5 p-4 bg-card rounded-2xl shadow-card text-left"
              >
                <span className="text-2xl shrink-0">{recipe.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{recipe.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{recipe.ingredients.length} ingredients</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const MealPlanner = () => {
  const { mealPlan, assignMeal, removeMeal } = useMealPlan();

  // Mon=0…Sun=6 to match weekDays array
  const jsDay = new Date().getDay(); // 0=Sun…6=Sat
  const todayIdx = (jsDay + 6) % 7;

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(todayIdx);
  const [pickerSlot, setPickerSlot] = useState<MealSlot | null>(null);

  const handleRemove = (day: string, slot: MealSlot) => {
    removeMeal(day, slot);
    toast.success('Meal removed');
  };

  const handleAssign = (day: string, slot: MealSlot, recipeId: string) => {
    assignMeal(day, slot, recipeId);
    const recipe = getRecipeById(recipeId);
    toast.success(`${recipe?.name ?? 'Meal'} added`);
  };

  // Monday of the displayed week
  const monday = new Date();
  monday.setDate(monday.getDate() - todayIdx + weekOffset * 7);

  const day = weekDays[selectedDay];
  const plan = mealPlan[day] ?? { breakfast: '', lunch: '', dinner: '' };
  const scrollRef = useRef<HTMLDivElement>(null);

  const weekLabel = (() => {
    const sun = new Date(monday.getTime() + 6 * 86400000);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (weekOffset === 0) return 'This week';
    if (weekOffset === 1) return 'Next week';
    if (weekOffset === -1) return 'Last week';
    return `${fmt(monday)} – ${fmt(sun)}`;
  })();

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <PageHeader title="Meal Planner" subtitle="Plan your week" />

      {/* Week navigation */}
      <div className="flex items-center justify-between px-5 mb-3">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-card shadow-card text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <span className="text-sm font-medium text-foreground">{weekLabel}</span>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-card shadow-card text-muted-foreground"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Day selector */}
      <div ref={scrollRef} className="flex gap-1.5 px-3 mb-6">
        {weekDays.map((d, i) => {
          const date = new Date(monday.getTime() + i * 86400000);
          const isToday = weekOffset === 0 && i === todayIdx;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(i)}
              className={`flex-1 h-[4.5rem] rounded-2xl flex flex-col items-center justify-center transition-all ${
                i === selectedDay
                  ? 'bg-primary text-primary-foreground shadow-card'
                  : 'bg-card text-muted-foreground shadow-card'
              }`}
            >
              <span className="text-[10px] font-light tracking-wide mb-1">{d}</span>
              <span className={`text-sm font-semibold tabular-nums leading-none ${isToday && i !== selectedDay ? 'text-primary' : ''}`}>
                {date.getDate()}
              </span>
              <span className={`mt-1 w-1 h-1 rounded-full ${isToday && i !== selectedDay ? 'bg-primary' : 'bg-transparent'}`} />
            </button>
          );
        })}
      </div>

      {/* Meal slots */}
      <div className="px-5 space-y-3">
        <h2 className="text-lg font-semibold">{fullWeekDays[selectedDay]}</h2>
        {mealSlots.map((slot, i) => {
          const recipe = getRecipeById(plan[slot]);
          return (
            <SwipeToDelete
              key={slot}
              onDelete={() => handleRemove(day, slot)}
              disabled={!recipe}
              className="animate-fade-in shadow-card"
            >
              <div className="bg-card rounded-2xl p-5" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground font-light capitalize">{slot}</span>
                  <button
                    onClick={() => setPickerSlot(slot)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary transition-transform active:scale-90"
                  >
                    <Plus className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                  </button>
                </div>
                {recipe ? (
                  <p className="font-semibold text-foreground">{recipe.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground font-light">Tap + to add a meal</p>
                )}
              </div>
            </SwipeToDelete>
          );
        })}
      </div>

      {/* Recipe picker sheet */}
      {pickerSlot && (
        <RecipePicker
          slot={pickerSlot}
          onSelect={recipeId => handleAssign(day, pickerSlot, recipeId)}
          onClose={() => setPickerSlot(null)}
        />
      )}
    </div>
  );
};

export default MealPlanner;
