import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStatusAI, type ProofAnalysis } from '@/hooks/useStatusAI';
import { Bot, CheckCircle, XCircle, AlertTriangle, Eye, Shield, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusAIProofValidatorProps {
  proofId: string;
  imageUrl: string;
  onValidated?: (analysis: ProofAnalysis) => void;
}

export const StatusAIProofValidator = ({ proofId, imageUrl, onValidated }: StatusAIProofValidatorProps) => {
  const { validateProof, analyzing } = useStatusAI();
  const [analysis, setAnalysis] = useState<ProofAnalysis | null>(null);

  const handleValidate = async () => {
    const result = await validateProof(proofId, imageUrl);
    if (result) {
      setAnalysis(result);
      onValidated?.(result);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getIntegrityColor = (integrity: number) => {
    if (integrity >= 80) return 'bg-success';
    if (integrity >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  if (!analysis) {
    return (
      <Button
        onClick={handleValidate}
        disabled={analyzing}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {analyzing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
        {analyzing ? 'StatusAI analisando...' : 'Validar com StatusAI'}
      </Button>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Análise StatusAI
          <Badge variant="outline" className={cn("ml-auto", getConfidenceColor(analysis.confidence))}>
            {analysis.confidence}% confiança
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          {analysis.is_valid_status ? (
            <CheckCircle className="h-5 w-5 text-success shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive shrink-0" />
          )}
          <span className="text-sm font-medium">
            {analysis.is_valid_status ? 'Print válido de WhatsApp Status' : 'Print inválido ou suspeito'}
          </span>
        </div>

        {analysis.view_count && (
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm">{analysis.view_count.toLocaleString()} visualizações detectadas</span>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Integridade do anúncio
            </span>
            <span className="font-medium">{analysis.ad_integrity}%</span>
          </div>
          <Progress value={analysis.ad_integrity} className={cn("h-2", getIntegrityColor(analysis.ad_integrity))} />
        </div>

        {analysis.issues.length > 0 && (
          <div className="space-y-1">
            {analysis.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-warning">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground border-t pt-2">{analysis.summary}</p>
      </CardContent>
    </Card>
  );
};
