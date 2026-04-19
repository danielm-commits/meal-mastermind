

## Recipes Discovery Screen — Tinder-Style Swipe

### Overview
Add a new `/discover` route with a card-swipe interface for browsing community recipes. Swipe right saves to collection, swipe left skips. Saved recipes integrate into the existing Recipes screen.

### Implementation

**1. Add community recipe data** (`src/data/mockData.ts`)
- Add ~10 new `communityRecipes` entries with additional fields: `prepTime`, `cuisine`, `dietaryTags` (e.g. "vegan", "gluten-free", "keto")
- Add a `savedRecipeIds` export (mutable array) for tracking saved recipes

**2. Create the Discovery page** (`src/pages/Discover.tsx`)
- **Filter bar** at top: horizontal scrollable chips for cuisine (Italian, Asian, Mexican, etc.), dietary preference (Vegan, Keto, etc.), and a calorie range toggle (< 300, 300-500, 500+)
- **Swipe card stack**: Use CSS transforms + touch/drag events (no external library) to create the swipe interaction:
  - Cards are stacked with a slight offset/scale for depth effect
  - Drag horizontally to swipe; threshold triggers save (right) or skip (left)
  - Visual feedback: green overlay + checkmark on right drag, red overlay + X on left drag
  - Spring-back animation if released below threshold
- **Card content**: Large emoji/photo area, recipe name, prep time badge, 4-stat nutrition row (cal, protein, carbs, fat), cuisine tag
- **Action buttons** below the card: X button (skip) and Heart button (save) for non-swipe interaction
- **Empty state**: "No more recipes to discover!" with a reset button

**3. Update navigation** (`src/components/BottomNav.tsx`)
- Add a Discover tab with `Compass` icon between Home and Planner

**4. Register route** (`src/App.tsx`)
- Add `/discover` route pointing to the Discover page

**5. Connect saved recipes** (`src/pages/Recipes.tsx`)
- Merge `savedRecipeIds` community recipes into the recipe list display
- Show a "Community" badge on imported recipes

### Technical Approach
- Pure React state + CSS transforms for the swipe gesture (pointer events for both touch and mouse)
- `useState` for card stack, filters, and saved IDs
- Animate with CSS transitions and `transform: translateX() rotate()`
- No external animation library needed — keeps bundle small

