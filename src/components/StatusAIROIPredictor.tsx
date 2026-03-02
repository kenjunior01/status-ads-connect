import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useStatusAI, type ROIPrediction } from '@/hooks/useStatusAI';
import { 
  Bot, TrendingUp, Eye, DollarSign, Target, AlertTriangle, 
  CheckCircle, Loader2, Sparkles, ChevronDown, ChevronUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusAIROIPredictorProps {
  creatorId: string;
  creatorName?: string;
}

export const StatusAIROIPredictor = ({ creatorId, creatorName }: StatusAIROIPredictorProps) => {
  const { predictROI, predicting } = useStatusAI();
  const [prediction, setPrediction] = useState<ROIPrediction | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [budget, setBudget] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handlePredict = async () => {
    const result = await predictROI(creatorId, budget ? parseFloat(budget) : undefined);
    if (result) {
      setPrediction(result.prediction);
      setCreatorInfo(result.creator);
    }
  };

  const getRecommendationConfig = (rec: string) => {
    switch (rec) {
      case 'highly_recommended': return { label: 'Altamente Recomendado', color: 'bg-success text-success-foreground', icon: CheckCircle };
      case 'recommended': return { label: 'Recomendado', color: 'bg-primary text-primary-foreground', icon: TrendingUp };
      case 'neutral': return { label: 'Neutro', color: 'bg-muted text-muted-foreground', icon: Target };
      case 'not_recommended': return { label: 'Não Recomendado', color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle };
      default: return { label: rec, color: 'bg-muted', icon: Target };
    }
  };

  if (!prediction) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            Previsão de ROI — StatusAI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Analise o potencial de retorno deste criador{creatorName ? ` (${creatorName})` : ''} com IA.
          </p>
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-xs">Orçamento previsto (opcional)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="R$ 500"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <Button onClick={handlePredict} disabled={predicting} size="sm" className="w-full gap-2">
            {predicting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {predicting ? 'Analisando...' : 'Prever ROI'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const recConfig = getRecommendationConfig(prediction.recommendation);
  const RecIcon = recConfig.icon;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Previsão de ROI — StatusAI
          <Badge className={cn("ml-auto", recConfig.color)}>
            <RecIcon className="h-3 w-3 mr-1" />
            {recConfig.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{prediction.estimated_views.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Views estimadas</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">R$ {prediction.estimated_cpv.toFixed(4)}</p>
            <p className="text-xs text-muted-foreground">CPV estimado</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{prediction.roi_score}</p>
            <p className="text-xs text-muted-foreground">Score ROI</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{prediction.conversion_probability}%</p>
            <p className="text-xs text-muted-foreground">Prob. conversão</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Score ROI</span>
            <span className="font-medium">{prediction.roi_score}/100</span>
          </div>
          <Progress value={prediction.roi_score} className="h-2" />
        </div>

        <p className="text-sm text-muted-foreground">{prediction.summary}</p>

        <Button variant="ghost" size="sm" className="w-full" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
          {expanded ? 'Menos detalhes' : 'Mais detalhes'}
        </Button>

        {expanded && (
          <div className="space-y-3 border-t pt-3">
            {prediction.strengths.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1 text-success">Pontos Fortes</p>
                {prediction.strengths.map((s, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-success shrink-0" /> {s}
                  </p>
                ))}
              </div>
            )}
            {prediction.risks.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1 text-warning">Riscos</p>
                {prediction.risks.map((r, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-warning shrink-0" /> {r}
                  </p>
                ))}
              </div>
            )}
            <div className="bg-muted/50 p-2 rounded text-xs">
              <span className="font-medium">Orçamento recomendado:</span> R$ {prediction.recommended_budget.toFixed(2)}
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full" onClick={() => { setPrediction(null); setBudget(''); }}>
          Nova análise
        </Button>
      </CardContent>
    </Card>
  );
};
