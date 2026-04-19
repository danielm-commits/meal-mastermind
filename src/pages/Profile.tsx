import { useState } from "react";
import { Pencil, Check, LogOut } from "lucide-react";
import BackButton from "@/components/BackButton";
import { useProfile } from "@/context/ProfileContext";
import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const { profile, updateName, setUnits } = useProfile();
  const { logout } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  const initials = profile.name
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const commitName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) updateName(trimmed);
    else setNameInput(profile.name);
    setEditingName(false);
  };

  return (
    <div className="pb-24 max-w-lg mx-auto">

      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        <BackButton />
        <h1 className="text-2xl font-bold tracking-tight mt-3">Profile</h1>
      </div>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center pb-8 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4 shadow-card">
          <span className="text-2xl font-bold text-primary-foreground">{initials}</span>
        </div>

        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => {
                if (e.key === "Enter") commitName();
                if (e.key === "Escape") { setNameInput(profile.name); setEditingName(false); }
              }}
              className="text-xl font-semibold text-center bg-secondary rounded-xl px-3 py-1.5 focus:outline-none w-48"
            />
            <button onClick={commitName} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setNameInput(profile.name); setEditingName(true); }}
            className="flex items-center gap-1.5 group"
          >
            <span className="text-xl font-semibold text-foreground">{profile.name}</span>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="px-5 space-y-6">

        {/* Units */}
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-foreground">Units</h2>
            <p className="text-sm text-muted-foreground font-light mt-0.5">Used for weights and measurements</p>
          </div>
          <div className="flex bg-secondary rounded-2xl p-1">
            {(["metric", "imperial"] as const).map(u => (
              <button
                key={u}
                onClick={() => setUnits(u)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl capitalize transition-all ${
                  profile.units === u
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground"
                }`}
              >
                {u === "metric" ? "Metric (g, ml)" : "Imperial (oz, fl oz)"}
              </button>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-border text-sm font-medium text-muted-foreground"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Sign out
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
