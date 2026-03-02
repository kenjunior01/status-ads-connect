import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useStatusAI, type MatchmakingResult, type CreatorMatch } from '@/hooks/useStatusAI';
import { Bot, Users, Target, Sparkles, Loader2, Star, Eye, DollarSign, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const NICHES = [
  'Tecnologia', 'Negócios', 'Finanças', 'Marketing', 'Moda', 'Beleza',
  'Fitness', 'Saúde', 'Gastronomia', 'Viagens', 'Educação', 'Entretenimento',
  'Games', 'Música', 'Esportes', 'Lifestyle',
];

export const StatusAIMatchmaker = () => {
  const { findMatches, matching } = useStatusAI();
  const [result, setResult] = useState<MatchmakingResult | null>(null);
  const [niche, setNiche] = useState('');
  const [budget, setBudget] = useState('');
  const [targetViews, setTargetViews] = useState('');
  const [description, setDescription] = useState('');

  const handleMatch = async () => {
    const res = await findMatches({
      niche: niche || undefined,
      budget: budget ? parseFloat(budget) : undefined,
      target_views: targetViews ? parseInt(targetViews) : undefined,
      campaign_description: description || undefined,
    });
    if (res) setResult(res);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            StatusAI Matchmaker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Descreva sua campanha e a IA encontrará os melhores criadores por afinidade de audiência.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Nicho</Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  {NICHES.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Orçamento (R$)</Label>
              <Input type="number" placeholder="500" value={budget} onChange={(e) => setBudget(e.target.value)} className="h-9" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Meta de visualizações</Label>
            <Input type="number" placeholder="10000" value={targetViews} onChange={(e) => setTargetViews(e.target.value)} className="h-9" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Descreva sua campanha</Label>
            <Textarea
              placeholder="Ex: Promoção de lançamento de app de delivery para público jovem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          <Button onClick={handleMatch} disabled={matching} className="w-full gap-2">
            {matching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {matching ? 'Analisando criadores...' : 'Encontrar Matches'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Resultados do StatusAI Matchmaker
            <Badge variant="outline" className="ml-auto">{result.matches.length} matches</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{result.summary}</p>
          {result.best_strategy && (
            <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg">
              <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{result.best_strategy}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {result.matches.map((match, index) => (
        <MatchCard key={match.creator_id || index} match={match} rank={index + 1} />
      ))}

      <Button variant="outline" className="w-full" onClick={() => setResult(null)}>
        Nova busca
      </Button>
    </div>
  );
};

function MatchCard({ match, rank }: { match: CreatorMatch; rank: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    return 'text-warning';
  };

  return (
    <Card className={cn(rank === 1 && "border-primary/30 bg-primary/5")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {rank}
            </span>
            <div>
              <p className="font-semibold text-sm">{match.creator_name}</p>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-xs", getScoreColor(match.match_score))}>
            {match.match_score}% match
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="p-2 bg-muted/50 rounded">
            <Eye className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs font-bold">{match.estimated_views?.toLocaleString() || 'N/D'}</p>
            <p className="text-[10px] text-muted-foreground">Views est.</p>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <DollarSign className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs font-bold">R$ {(match.estimated_cost || 0).toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Custo est.</p>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <Star className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs font-bold">{match.audience_affinity || 0}%</p>
            <p className="text-[10px] text-muted-foreground">Afinidade</p>
          </div>
        </div>

        {match.reasons && match.reasons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {match.reasons.slice(0, 3).map((reason, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">{reason}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
