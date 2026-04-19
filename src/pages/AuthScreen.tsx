import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Mode = 'signin' | 'register';

const AuthScreen = ({ onAuth }: { onAuth: (name: string) => void }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('register');

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async () => {
    setError(null);

    // Basic validation
    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name'); return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email'); return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }

    setLoading(true);
    // Tiny artificial delay for feel
    await new Promise(r => setTimeout(r, 300));

    if (mode === 'register') {
      const err = register(name, email, password);
      if (err) { setError(err); setLoading(false); return; }
      onAuth(name.trim());
    } else {
      const err = login(email, password);
      if (err) { setError(err); setLoading(false); return; }
      const users: Array<{ name: string; email: string }> =
        JSON.parse(localStorage.getItem('mm_users') ?? '[]');
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      onAuth(found?.name ?? '');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-5 py-10">

      {/* Brand */}
      <div className="flex flex-col items-center mb-10 animate-fade-in">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">Meal Mastermind</h1>
        <p className="text-sm text-muted-foreground mt-1">Plan smarter. Eat better.</p>
      </div>

      {/* Form card */}
      <div
        className="w-full max-w-sm bg-card rounded-3xl shadow-card p-6 space-y-3 animate-fade-in"
        style={{ animationDelay: '0.08s' }}
      >
        {/* Name (register only) */}
        {mode === 'register' && (
          <input
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={e => { setName(e.target.value); setError(null); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full h-12 px-4 bg-secondary rounded-2xl text-sm placeholder:text-muted-foreground focus:outline-none"
          />
        )}

        {/* Email */}
        <input
          type="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(null); }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="w-full h-12 px-4 bg-secondary rounded-2xl text-sm placeholder:text-muted-foreground focus:outline-none"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(null); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full h-12 px-4 pr-12 bg-secondary rounded-2xl text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPw
              ? <EyeOff className="w-4 h-4" strokeWidth={1.5} />
              : <Eye    className="w-4 h-4" strokeWidth={1.5} />
            }
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-destructive px-1 animate-fade-in">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 transition-opacity mt-1"
        >
          {loading
            ? '…'
            : mode === 'register' ? 'Create account' : 'Sign in'}
        </button>
      </div>

      {/* Switch mode link */}
      <p className="text-sm text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '0.12s' }}>
        {mode === 'register' ? 'Already have an account? ' : "Don't have an account? "}
        <button
          onClick={() => switchMode(mode === 'register' ? 'signin' : 'register')}
          className="text-primary font-medium"
        >
          {mode === 'register' ? 'Sign in' : 'Create one'}
        </button>
      </p>
    </div>
  );
};

export default AuthScreen;
