export interface Recipe {
  id: string;
  name: string;
  image: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  tags: string[];
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'ok' | 'low' | 'critical';
  neededFor?: string;
  manual?: boolean;
  category?: string;
  lowThreshold?: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  estimatedCost: number;
  checked: boolean;
  category: string;
  manual?: boolean;
}

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const fullWeekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const recipes: Recipe[] = [
  {
    id: '1', name: 'Avocado Toast', image: '🥑',
    ingredients: [
      { name: 'Sourdough bread', amount: '2 slices' },
      { name: 'Avocado', amount: '1 whole' },
      { name: 'Cherry tomatoes', amount: '6 pcs' },
      { name: 'Lemon juice', amount: '1 tbsp' },
      { name: 'Salt & pepper', amount: 'to taste' },
    ],
    steps: ['Toast the sourdough bread until golden.', 'Mash the avocado with lemon juice, salt, and pepper.', 'Spread avocado on toast and top with halved cherry tomatoes.'],
    tags: ['breakfast', 'quick', 'vegetarian'],
  },
  {
    id: '2', name: 'Grilled Chicken Salad', image: '🥗',
    ingredients: [
      { name: 'Chicken breast', amount: '200g' },
      { name: 'Mixed greens', amount: '100g' },
      { name: 'Cucumber', amount: '1/2' },
      { name: 'Olive oil', amount: '2 tbsp' },
      { name: 'Feta cheese', amount: '30g' },
    ],
    steps: ['Season and grill chicken breast for 6-7 min per side.', 'Slice cucumber and toss with mixed greens.', 'Slice chicken, arrange on salad, drizzle with olive oil, top with feta.'],
    tags: ['lunch', 'high-protein', 'healthy'],
  },
  {
    id: '3', name: 'Pasta Bolognese', image: '🍝',
    ingredients: [
      { name: 'Penne pasta', amount: '200g' },
      { name: 'Ground beef', amount: '150g' },
      { name: 'Tomato sauce', amount: '200ml' },
      { name: 'Onion', amount: '1 medium' },
      { name: 'Garlic', amount: '2 cloves' },
      { name: 'Parmesan', amount: '20g' },
    ],
    steps: ['Cook pasta according to package directions.', 'Sauté diced onion and garlic until soft.', 'Add ground beef, cook until browned.', 'Pour in tomato sauce, simmer for 15 min.', 'Toss pasta with sauce, top with parmesan.'],
    tags: ['dinner', 'comfort-food'],
  },
  {
    id: '4', name: 'Berry Smoothie Bowl', image: '🫐',
    ingredients: [
      { name: 'Mixed berries (frozen)', amount: '150g' },
      { name: 'Banana', amount: '1 medium' },
      { name: 'Greek yogurt', amount: '100g' },
      { name: 'Granola', amount: '30g' },
      { name: 'Honey', amount: '1 tbsp' },
    ],
    steps: ['Blend frozen berries, banana, and yogurt until thick and smooth.', 'Pour into a bowl.', 'Top with granola and a drizzle of honey.'],
    tags: ['breakfast', 'quick', 'healthy'],
  },
  {
    id: '5', name: 'Salmon & Rice', image: '🐟',
    ingredients: [
      { name: 'Salmon fillet', amount: '180g' },
      { name: 'Jasmine rice', amount: '150g' },
      { name: 'Broccoli', amount: '100g' },
      { name: 'Soy sauce', amount: '2 tbsp' },
      { name: 'Sesame oil', amount: '1 tsp' },
    ],
    steps: ['Cook rice according to package directions.', 'Season salmon with soy sauce, pan-sear 4 min per side.', 'Steam broccoli for 3-4 min.', 'Plate rice, salmon, and broccoli. Drizzle with sesame oil.'],
    tags: ['dinner', 'high-protein', 'healthy'],
  },
  {
    id: '6', name: 'Turkey Wrap', image: '🌯',
    ingredients: [
      { name: 'Tortilla wrap', amount: '1 large' },
      { name: 'Turkey slices', amount: '100g' },
      { name: 'Lettuce', amount: '2 leaves' },
      { name: 'Tomato', amount: '1/2' },
      { name: 'Mustard', amount: '1 tbsp' },
    ],
    steps: ['Lay out the tortilla, spread mustard.', 'Layer turkey, lettuce, and sliced tomato.', 'Roll up tightly and slice in half.'],
    tags: ['lunch', 'quick'],
  },
];

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export const weeklyMealPlan: Record<string, Record<MealSlot, string>> = {
  Mon: { breakfast: '1', lunch: '2', dinner: '3' },
  Tue: { breakfast: '4', lunch: '6', dinner: '5' },
  Wed: { breakfast: '1', lunch: '2', dinner: '3' },
  Thu: { breakfast: '4', lunch: '6', dinner: '5' },
  Fri: { breakfast: '1', lunch: '2', dinner: '3' },
  Sat: { breakfast: '4', lunch: '6', dinner: '5' },
  Sun: { breakfast: '1', lunch: '6', dinner: '3' },
};

export const pantryItems: PantryItem[] = [
  { id: '1', name: 'Penne Pasta', quantity: 100, unit: 'g', status: 'critical', neededFor: "Thursday's dinner" },
  { id: '2', name: 'Chicken Breast', quantity: 400, unit: 'g', status: 'ok' },
  { id: '3', name: 'Mixed Greens', quantity: 50, unit: 'g', status: 'low', neededFor: "Wednesday's lunch" },
  { id: '4', name: 'Avocado', quantity: 3, unit: 'pcs', status: 'ok' },
  { id: '5', name: 'Sourdough Bread', quantity: 4, unit: 'slices', status: 'ok' },
  { id: '6', name: 'Salmon Fillet', quantity: 180, unit: 'g', status: 'ok' },
  { id: '7', name: 'Greek Yogurt', quantity: 100, unit: 'g', status: 'low', neededFor: "Tuesday's breakfast" },
  { id: '8', name: 'Rice', quantity: 500, unit: 'g', status: 'ok' },
  { id: '9', name: 'Tomato Sauce', quantity: 150, unit: 'ml', status: 'low' },
  { id: '10', name: 'Ground Beef', quantity: 0, unit: 'g', status: 'critical', neededFor: "Monday's dinner" },
  { id: '11', name: 'Bananas', quantity: 2, unit: 'pcs', status: 'ok' },
  { id: '12', name: 'Olive Oil', quantity: 200, unit: 'ml', status: 'ok' },
];

export const shoppingList: ShoppingItem[] = [
  { id: '1', name: 'Ground Beef', amount: '300g', estimatedCost: 0, checked: false, category: 'Meat' },
  { id: '2', name: 'Penne Pasta', amount: '500g', estimatedCost: 0, checked: false, category: 'Pantry' },
  { id: '3', name: 'Cherry Tomatoes', amount: '250g', estimatedCost: 0, checked: true, category: 'Produce' },
  { id: '4', name: 'Mixed Greens', amount: '200g', estimatedCost: 0, checked: false, category: 'Produce' },
  { id: '5', name: 'Greek Yogurt', amount: '500g', estimatedCost: 0, checked: false, category: 'Dairy' },
  { id: '6', name: 'Frozen Berries', amount: '300g', estimatedCost: 0, checked: true, category: 'Frozen' },
  { id: '7', name: 'Salmon Fillet', amount: '360g', estimatedCost: 0, checked: false, category: 'Seafood' },
  { id: '8', name: 'Tortilla Wraps', amount: '6 pack', estimatedCost: 0, checked: false, category: 'Bakery' },
  { id: '9', name: 'Turkey Slices', amount: '200g', estimatedCost: 0, checked: false, category: 'Deli' },
  { id: '10', name: 'Tomato Sauce', amount: '400ml', estimatedCost: 0, checked: true, category: 'Pantry' },
];

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find(r => r.id === id);
}
