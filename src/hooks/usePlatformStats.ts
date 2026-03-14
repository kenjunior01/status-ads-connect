import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformStats {
  overview: {
    total_creators: number;
    total_campaigns: number;
    active_campaigns: number;
    completed_campaigns: number;
    total_views: number;
    total_revenue: number;
    total_paid_to_creators: number;
    total_campaign_value: number;
    completion_rate: number;
    avg_campaign_value: number;
  };
  niche_distribution: { name: string; count: number }[];
  activity_timeline: { date: string; campaigns: number; volume: number }[];
  updated_at: string;
}

export const usePlatformStats = (refreshInterval = 60000) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('platform-stats');
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        setStats(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { stats, loading, error };
};
