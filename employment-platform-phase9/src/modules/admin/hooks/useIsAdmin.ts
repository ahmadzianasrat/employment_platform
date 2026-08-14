import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { useAuth } from '../../../lib/auth/AuthContext';

export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(!!data);
        setChecking(false);
      });
  }, [user, authLoading]);

  return { isAdmin, checking: checking || authLoading };
}
