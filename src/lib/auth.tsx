import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role, User } from "@/data/mockData";

type Session = Pick<User, "id" | "name" | "email" | "role" | "location">;
interface AuthCtx { user: Session | null; ready: boolean; signIn: (u: User) => void; signOut: () => void }
const Ctx = createContext<AuthCtx | null>(null);
const KEY = "agriassist.session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem(KEY) || "null")); } catch { /* ignore */ }
    setReady(true);
  }, []);
  // signIn also refreshes the session after a profile edit.
  const signIn = (u: User) => {
    const s = { id: u.id, name: u.name, email: u.email, role: u.role, location: u.location };
    localStorage.setItem(KEY, JSON.stringify(s));
    setUser(s);
  };
  const signOut = () => { localStorage.removeItem(KEY); setUser(null); };
  return <Ctx.Provider value={{ user, ready, signIn, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};

export const homeFor = (role: Role) => (role === "farmer" ? "/farmer" : role === "admin" ? "/admin" : "/marketplace");
