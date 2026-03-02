import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProofAnalysis {
  view_count: number | null;
  is_valid_status: boolean;
  ad_integrity: number;
  posting_time: string | null;
  confidence: number;
  issues: string[];
  summary: string;
}

interface ROIPrediction {
  estimated_views: number;
  estimated_reach: number;
  estimated_cpv: number;
  roi_score: number;
  conversion_probability: number;
  recommended_budget: number;
  strengths: string[];
  risks: string[];
  recommendation: 'highly_recommended' | 'recommended' | 'neutral' | 'not_recommended';
  summary: string;
}

interface CreatorMatch {
  creator_id: string;
  creator_name: string;
  match_score: number;
  estimated_views: number;
  estimated_cost: number;
  reasons: string[];
  audience_affinity: number;
}

interface MatchmakingResult {
  matches: CreatorMatch[];
  summary: string;
  best_strategy: string;
}

export const useStatusAI = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [matching, setMatching] = useState(false);
  const { toast } = useToast();

  const handleError = (error: any) => {
    const msg = error?.message || 'Erro desconhecido';
    if (msg.includes('429') || msg.includes('Rate limit')) {
      toast({ title: "Limite de requisições atingido", description: "Tente novamente em alguns segundos.", variant: "destructive" });
    } else if (msg.includes('402') || msg.includes('Payment')) {
      toast({ title: "Créditos insuficientes", description: "Adicione créditos ao seu workspace para usar o StatusAI.", variant: "destructive" });
    } else {
      toast({ title: "Erro no StatusAI", description: msg, variant: "destructive" });
    }
  };

  const validateProof = async (proofId: string, imageUrl: string): Promise<ProofAnalysis | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('statusai', {
        body: { action: 'validate-proof', proof_id: proofId, image_url: imageUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Análise concluída!", description: data.analysis?.summary || "Print analisado pelo StatusAI." });
      return data.analysis as ProofAnalysis;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const predictROI = async (creatorId: string, campaignBudget?: number): Promise<{ prediction: ROIPrediction; creator: any } | null> => {
    setPredicting(true);
    try {
      const { data, error } = await supabase.functions.invoke('statusai', {
        body: { action: 'predict-roi', creator_id: creatorId, campaign_budget: campaignBudget },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return { prediction: data.prediction, creator: data.creator };
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setPredicting(false);
    }
  };

  const findMatches = async (params: {
    niche?: string;
    budget?: number;
    target_views?: number;
    campaign_description?: string;
  }): Promise<MatchmakingResult | null> => {
    setMatching(true);
    try {
      const { data, error } = await supabase.functions.invoke('statusai', {
        body: { action: 'matchmaking', ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return { matches: data.matches, summary: data.summary, best_strategy: data.best_strategy };
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setMatching(false);
    }
  };

  return {
    validateProof,
    predictROI,
    findMatches,
    analyzing,
    predicting,
    matching,
  };
};

export type { ProofAnalysis, ROIPrediction, CreatorMatch, MatchmakingResult };
