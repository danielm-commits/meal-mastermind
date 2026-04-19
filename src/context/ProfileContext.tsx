import { createContext, useContext, useState, ReactNode } from "react";

export interface Profile {
  name: string;
  units: "metric" | "imperial";
}

interface ProfileContextType {
  profile: Profile;
  updateName: (name: string) => void;
  setUnits: (units: "metric" | "imperial") => void;
}

const getDefaultName = (): string => {
  try {
    const session = JSON.parse(localStorage.getItem('mm_session') ?? 'null');
    return session?.name ?? 'You';
  } catch { return 'You'; }
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile>(() => ({
    name: getDefaultName(),
    units: "metric",
  }));

  const updateName = (name: string) => setProfile(p => ({ ...p, name }));
  const setUnits = (units: "metric" | "imperial") => setProfile(p => ({ ...p, units }));

  return (
    <ProfileContext.Provider value={{ profile, updateName, setUnits }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
};
