import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  isReady: boolean;
  isLoading: boolean;
}

const defaultState: AuthState = {
  user: null,
  session: null,
  userRole: null,
  isReady: false,
  isLoading: true,
};

export const useAuthReady = () => {
  const [state, setState] = useState<AuthState>(defaultState);

  useEffect(() => {
    let mounted = true;

    // Set up listener FIRST (before getSession)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        const user = session?.user ?? null;
        let role: string | null = null;

        if (user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const { data } = await supabase.rpc('get_user_role', { _user_id: user.id });
              role = data;
            } catch (e) {
              console.error('Error fetching role:', e);
            }
            setState({ user, session, userRole: role, isReady: true, isLoading: false });
          }, 0);
        } else {
          setState({ user: null, session: null, userRole: null, isReady: true, isLoading: false });
        }
      }
    );

    // Then restore session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const user = session?.user ?? null;
      let role: string | null = null;

      if (user) {
        try {
          const { data } = await supabase.rpc('get_user_role', { _user_id: user.id });
          role = data;
        } catch (e) {
          console.error('Error fetching role:', e);
        }
      }

      setState({ user, session, userRole: role, isReady: true, isLoading: false });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getDashboardPage = () => {
    if (state.userRole === 'admin') return 'admin-dashboard';
    if (state.userRole === 'advertiser') return 'advertiser-dashboard';
    return 'creator-dashboard';
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { ...state, getDashboardPage, logout };
};
