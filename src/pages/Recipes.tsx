import { useState } from "react";
import { Search, Plus, Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import SwipeToDelete from "@/components/SwipeToDelete";
import { recipes as defaultRecipes, Recipe } from "@/data/mockData";

// ─── Recipe Card ────────────────────────────────────────────────────────────

const RecipeCard = ({
  recipe,
  onClick,
  isFav,
  onToggleFav,
  onRemove,
}: {
  recipe: Recipe;
  onClick: () => void;
  isFav: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
  onRemove: (e: React.MouseEvent) => void;
}) => (
  <div className="relative w-full bg-card rounded-2xl p-5 flex items-center gap-4 shadow-card">
    <button onClick={onClick} className="absolute inset-0 rounded-2xl" />
    <div className="flex-1 min-w-0 relative pointer-events-none">
      <p className="font-semibold text-foreground">{recipe.name}</p>
      <p className="text-sm text-muted-foreground mt-1">{recipe.ingredients.length} ingredients</p>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        {recipe.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{tag}</span>
        ))}
      </div>
    </div>
    <div className="relative flex items-center gap-1 shrink-0">
      <button onClick={onToggleFav} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors">
        <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-muted-foreground'}`} strokeWidth={1.5} />
      </button>
      <button onClick={onRemove} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors">
        <Trash2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
      </button>
    </div>
  </div>
);

// ─── Recipe Detail ───────────────────────────────────────────────────────────

const RecipeDetail = ({ recipe, onBack, isFav, onToggleFav }: { recipe: Recipe; onBack: () => void; isFav: boolean; onToggleFav: () => void }) => (
  <div className="pb-24 max-w-lg mx-auto">
    <div className="px-5 pt-8">
      <div className="flex items-center justify-between mb-6">
        <BackButton onClick={onBack} />
        <button onClick={onToggleFav} className="w-9 h-9 rounded-full flex items-center justify-center">
          <Heart className={`w-5 h-5 ${isFav ? 'fill-primary text-primary' : 'text-muted-foreground'}`} strokeWidth={1.5} />
        </button>
      </div>
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{recipe.image}</span>
          <h1 className="text-[28px] font-bold tracking-tight">{recipe.name}</h1>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {recipe.tags.map(tag => (
            <span key={tag} className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      <h2 className="text-base font-semibold mb-3">Ingredients</h2>
      <div className="bg-card rounded-2xl divide-y divide-secondary mb-6 shadow-card">
        {recipe.ingredients.map(ing => (
          <div key={ing.name} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm font-medium">{ing.name}</span>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">{ing.amount}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-base font-semibold mb-3">Steps</h2>
      <div className="space-y-4 mb-6">
        {recipe.steps.map((step, i) => (
          <div key={i} className="flex gap-3.5 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-primary-foreground">{i + 1}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed pt-0.5">{step}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Create Recipe ───────────────────────────────────────────────────────────

const AVAILABLE_TAGS = ['breakfast', 'lunch', 'dinner', 'quick', 'healthy', 'vegetarian', 'vegan', 'high-protein', 'comfort-food', 'gluten-free'];

const CreateRecipe = ({ onSave, onCancel }: { onSave: (r: Recipe) => void; onCancel: () => void }) => {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [tags, setTags] = useState<string[]>([]);

  const toggleTag = (tag: string) =>
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const updateIngredient = (i: number, field: string, val: string) =>
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));
  const removeIngredient = (i: number) =>
    setIngredients(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      image: '🍽️',
      ingredients: ingredients
        .filter(i => i.name.trim())
        .map(i => ({ name: i.name, amount: i.amount })),
      steps: [],
      tags,
    });
  };

  return (
    <div className="pb-36 max-w-lg mx-auto">
      {/* Header */}
      <div className="px-5 pt-8 pb-2 flex items-center gap-3">
        <BackButton onClick={onCancel} />
        <h1 className="text-[28px] font-bold tracking-tight">New Recipe</h1>
      </div>

      {/* Name */}
      <div className="px-5 mt-5 mb-6">
        <h2 className="text-base font-semibold mb-3">Basic info</h2>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Recipe name"
          className="w-full h-12 px-4 bg-card rounded-2xl text-sm font-medium placeholder:text-muted-foreground focus:outline-none shadow-card"
        />
      </div>

      {/* Ingredients */}
      <div className="px-5 mb-6">
        <h2 className="text-base font-semibold mb-3">Ingredients</h2>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <SwipeToDelete key={i} onDelete={() => removeIngredient(i)} disabled={ingredients.length === 1}>
              <div className="flex gap-2">
                <input
                  value={ing.name}
                  onChange={e => updateIngredient(i, 'name', e.target.value)}
                  placeholder="Name"
                  className="flex-1 h-11 px-3 bg-card rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none shadow-card"
                />
                <input
                  value={ing.amount}
                  onChange={e => updateIngredient(i, 'amount', e.target.value)}
                  placeholder="Qty"
                  type="number"
                  inputMode="numeric"
                  className="w-20 h-11 px-3 bg-card rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none shadow-card"
                />
              </div>
            </SwipeToDelete>
          ))}
          <button
            onClick={() => setIngredients(prev => [...prev, { name: '', amount: '' }])}
            className="w-full h-11 rounded-xl bg-card shadow-card flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add ingredient
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="px-5 mb-6">
        <h2 className="text-base font-semibold mb-3">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`h-8 px-3.5 rounded-full text-xs font-medium transition-colors ${
                tags.includes(tag)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground shadow-card'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Save CTA — fixed to bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 px-5 pt-3 bg-background/90 backdrop-blur-sm border-t border-border"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full max-w-lg mx-auto flex items-center justify-center h-14 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-35 transition-opacity shadow-card"
        >
          Save Recipe
        </button>
      </div>
    </div>
  );
};


// ─── Main Recipes page ───────────────────────────────────────────────────────

const Recipes = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [creating, setCreating] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const allRecipes = [...customRecipes, ...defaultRecipes].filter(r => !removedIds.has(r.id));
  const filtered = allRecipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const removeRecipe = (id: string) => {
    setRemovedIds(prev => new Set(prev).add(id));
    if (selected?.id === id) setSelected(null);
    toast.success('Recipe removed');
  };

  const handleSave = (recipe: Recipe) => {
    setCustomRecipes(prev => [recipe, ...prev]);
    setCreating(false);
    setSelected(recipe);
  };

  const sorted = [...filtered].sort((a, b) =>
    (favorites.has(a.id) ? 0 : 1) - (favorites.has(b.id) ? 0 : 1)
  );

  // Create view
  if (creating) {
    return <CreateRecipe onSave={handleSave} onCancel={() => setCreating(false)} />;
  }

  // Detail view
  if (selected) {
    return (
      <RecipeDetail
        recipe={selected}
        onBack={() => setSelected(null)}
        isFav={favorites.has(selected.id)}
        onToggleFav={() => toggleFav(selected.id)}
      />
    );
  }

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <PageHeader title="Recipes" subtitle={`${allRecipes.length} saved recipes`} />

      {/* Search */}
      <div className="px-5 mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full h-12 pl-11 pr-4 bg-card rounded-2xl text-sm placeholder:text-muted-foreground focus:outline-none shadow-card"
          />
        </div>
      </div>

      {/* Recipe list / empty states */}
      <div className="px-5 space-y-2.5">
        {sorted.length === 0 && search ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center animate-fade-in">
            <p className="text-base font-semibold text-foreground">No results for "{search}"</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different name or tag</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center animate-fade-in">
            <p className="text-base font-semibold text-foreground">No recipes yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Save your favourites and create your own</p>
            <button
              onClick={() => setCreating(true)}
              className="h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-card"
            >
              Create your first recipe
            </button>
          </div>
        ) : sorted.map((recipe, i) => (
          <div key={recipe.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
            <RecipeCard
              recipe={recipe}
              onClick={() => setSelected(recipe)}
              isFav={favorites.has(recipe.id)}
              onToggleFav={(e) => { e.stopPropagation(); toggleFav(recipe.id); }}
              onRemove={(e) => { e.stopPropagation(); removeRecipe(recipe.id); }}
            />
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setCreating(true)}
        className="fixed right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40 transition-transform active:scale-95"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px) + 1.5rem)', backgroundColor: '#2B4C7E' }}
        aria-label="Create recipe"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2} />
      </button>
    </div>
  );
};

export default Recipes;
