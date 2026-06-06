// ─── ORKESTRANDO — Session Provider ───

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { SessionContextType } from "@/types";

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
});

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // getSession() reads from localStorage without server verification.
        // Validate against the server so stale/revoked tokens are detected
        // immediately instead of triggering _recoverAndRefresh 400 loops.
        const { error } = await supabase.auth.getUser();
        if (error) {
          // Token is invalid on the server — clear localStorage so the
          // refresh loop stops firing on every subsequent page load.
          await supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(session);
        }
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      // Attempt to clear any corrupted session data from localStorage.
      try {
        const client = getSupabaseBrowserClient();
        if (client) await client.auth.signOut();
      } catch {
        // signOut itself can fail if tokens are fully corrupt — ignore.
      }
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // SIGNED_OUT is fired automatically by Supabase after a failed token
      // refresh, so explicitly nulling the session here stops any stale UI.
      if (event === "SIGNED_OUT") {
        setSession(null);
      } else {
        setSession(session);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchSession]);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}
