/**
 * AUTH SESSION CONTEXT
 * Exposes user/admin/loading and Supabase sign-in/out to React components.
 * `is_admin` checks the database allowlist; RLS still enforces real permissions.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { configured, supabase } from "../lib/supabase.js";
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(configured);
  useEffect(() => {
    if (!configured) return;
    let alive = true;
    // Recheck administrator permission whenever the active session changes.
    async function refresh(session) {
      if (!alive) return;
      setUser(session?.user ?? null);
      if (!session?.user) {
        setAdmin(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase.rpc("is_admin");
      if (!alive) return;
      setAdmin(!error && data === true);
      setLoading(false);
    }
    supabase.auth
      .getSession()
      .then(({ data }) => refresh(data.session))
      .catch(() => setLoading(false));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Awaiting setState on callback may deadlock auth internals; defer the RPC.
      setTimeout(() => refresh(session), 0);
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);
  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });
  const signOut = () => supabase.auth.signOut();
  return (
    <AuthContext.Provider value={{ user, admin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
