import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  creator_id: string;
  advertiser_id: string;
  title: string;
  description: string | null;
  price: number;
  status: string | null;
  created_at: string | null;
  completed_at: string | null;
}

interface CreateCampaignData {
  title: string;
  description?: string;
  price: number;
  creator_id: string;
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCampaigns([]);
        return;
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .or(`creator_id.eq.${user.id},advertiser_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      toast({
        title: "Erro ao carregar campanhas",
        description: "Não foi possível carregar suas campanhas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData: CreateCampaignData) => {
    try {
      setCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          advertiser_id: user.id,
          creator_id: campaignData.creator_id,
          title: campaignData.title,
          description: campaignData.description || null,
          price: campaignData.price,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setCampaigns(prev => [data, ...prev]);
      toast({
        title: "Campanha criada!",
        description: "Sua campanha foi criada com sucesso.",
      });

      return data;
    } catch (err) {
      console.error('Error creating campaign:', err);
      toast({
        title: "Erro ao criar campanha",
        description: "Não foi possível criar a campanha.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const updateData: { status: string; completed_at?: string } = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;

      setCampaigns(prev => prev.map(c => c.id === campaignId ? data : c));
      toast({
        title: "Status atualizado!",
        description: `Campanha ${status === 'completed' ? 'concluída' : 'atualizada'} com sucesso.`,
      });

      return data;
    } catch (err) {
      console.error('Error updating campaign:', err);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getCampaignsByStatus = (status: string) => {
    return campaigns.filter(c => c.status === status);
  };

  const getActiveCampaigns = () => {
    return campaigns.filter(c => c.status === 'active' || c.status === 'pending');
  };

  const getCompletedCampaigns = () => {
    return campaigns.filter(c => c.status === 'completed');
  };

  useEffect(() => {
    fetchCampaigns();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCampaigns();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    campaigns,
    loading,
    creating,
    createCampaign,
    updateCampaignStatus,
    getCampaignsByStatus,
    getActiveCampaigns,
    getCompletedCampaigns,
    refetch: fetchCampaigns,
  };
};
