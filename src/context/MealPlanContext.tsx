import { createContext, useContext, useState, ReactNode } from "react";
import { weeklyMealPlan, MealSlot } from "@/data/mockData";

type MealPlan = Record<string, Record<MealSlot, string>>;

interface MealPlanContextType {
  mealPlan: MealPlan;
  assignMeal: (day: string, slot: MealSlot, recipeId: string) => void;
  removeMeal: (day: string, slot: MealSlot) => void;
}

const STORAGE_KEY = 'mm_meal_plan';

const loadPlan = (): MealPlan => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { ...weeklyMealPlan };
  } catch {
    return { ...weeklyMealPlan };
  }
};

const savePlan = (plan: MealPlan) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));

const MealPlanContext = createContext<MealPlanContextType | null>(null);

export const MealPlanProvider = ({ children }: { children: ReactNode }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan>(loadPlan);

  const assignMeal = (day: string, slot: MealSlot, recipeId: string) => {
    setMealPlan(prev => {
      const next = {
        ...prev,
        [day]: { ...(prev[day] ?? weeklyMealPlan[day] ?? { breakfast: '', lunch: '', dinner: '' }), [slot]: recipeId },
      };
      savePlan(next);
      return next;
    });
  };

  const removeMeal = (day: string, slot: MealSlot) => {
    setMealPlan(prev => {
      const next = {
        ...prev,
        [day]: { ...(prev[day] ?? {}), [slot]: '' },
      };
      savePlan(next);
      return next;
    });
  };

  return (
    <MealPlanContext.Provider value={{ mealPlan, assignMeal, removeMeal }}>
      {children}
    </MealPlanContext.Provider>
  );
};

export const useMealPlan = () => {
  const ctx = useContext(MealPlanContext);
  if (!ctx) throw new Error('useMealPlan must be used within MealPlanProvider');
  return ctx;
};
