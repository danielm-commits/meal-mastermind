import { createContext, useContext, useState, ReactNode } from "react";

interface AuthUser {
  name: string;
  email: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => string | null; // returns error or null
  register: (name: string, email: string, password: string) => string | null;
  logout: () => void;
}

const STORAGE_KEY = 'mm_users';
const SESSION_KEY = 'mm_session';

const getUsers = (): StoredUser[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
};
const saveUsers = (users: StoredUser[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

const getSession = (): AuthUser | null => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); }
  catch { return null; }
};
const saveSession = (user: AuthUser | null) =>
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(getSession);

  const login = (email: string, password: string): string | null => {
    const users = getUsers();
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return 'Incorrect email or password';
    const authUser = { name: found.name, email: found.email };
    setUser(authUser);
    saveSession(authUser);
    return null;
  };

  const register = (name: string, email: string, password: string): string | null => {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return 'An account with this email already exists';
    }
    const newUser: StoredUser = { name: name.trim(), email: email.toLowerCase().trim(), password };
    saveUsers([...users, newUser]);
    const authUser = { name: newUser.name, email: newUser.email };
    setUser(authUser);
    saveSession(authUser);
    return null;
  };

  const logout = () => {
    setUser(null);
    saveSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
