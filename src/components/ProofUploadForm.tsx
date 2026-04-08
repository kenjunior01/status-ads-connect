import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCampaignProofs } from '@/hooks/useCampaignProofs';
import { useStatusAI } from '@/hooks/useStatusAI';
import { 
  Upload, 
  Image, 
  Video, 
  Link, 
  Loader2, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Bot,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProofUploadFormProps {
  campaignId: string;
  onSuccess?: () => void;
}

export const ProofUploadForm = ({ campaignId, onSuccess }: ProofUploadFormProps) => {
  const { t } = useTranslation();
  const { proofs, loading, uploading, uploadProof } = useCampaignProofs(campaignId);
  const { validateProof, analyzing } = useStatusAI();
  const [proofType, setProofType] = useState<'screenshot' | 'video' | 'link'>('screenshot');
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [viewCount, setViewCount] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiValidated, setAiValidated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleAIValidation = async () => {
    if (!preview && !linkUrl) return;
    const imageUrl = preview || linkUrl;
    const result = await validateProof('preview', imageUrl);
    if (result) {
      setAiAnalysis(result);
      setAiValidated(true);
    }
  };

  const handleSubmit = async () => {
    const result = await uploadProof({
      campaign_id: campaignId,
      proof_type: proofType,
      file: file || undefined,
      link_url: proofType === 'link' ? linkUrl : undefined,
      view_count: viewCount ? parseInt(viewCount) : undefined,
    });

    if (result) {
      // If we have a preview (screenshot), trigger AI validation on the uploaded proof
      if (result.file_url && proofType === 'screenshot') {
        validateProof(result.id, result.file_url);
      }
      setFile(null);
      setLinkUrl('');
      setViewCount('');
      setPreview(null);
      setAiAnalysis(null);
      setAiValidated(false);
      onSuccess?.();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`verification.${status}` as const) || status;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('verification.uploadProof')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>{t('verification.proofType')}</Label>
            <RadioGroup
              value={proofType}
              onValueChange={(value) => setProofType(value as 'screenshot' | 'video' | 'link')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="screenshot" id="screenshot" />
                <Label htmlFor="screenshot" className="flex items-center gap-1 cursor-pointer">
                  <Image className="h-4 w-4" />
                  {t('verification.screenshot')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="flex items-center gap-1 cursor-pointer">
                  <Video className="h-4 w-4" />
                  {t('verification.video')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="link" id="link" />
                <Label htmlFor="link" className="flex items-center gap-1 cursor-pointer">
                  <Link className="h-4 w-4" />
                  {t('verification.link')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {proofType !== 'link' ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={proofType === 'screenshot' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-32 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full object-contain" />
                ) : file ? (
                  <span>{file.name}</span>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <span>Clique para selecionar {proofType === 'screenshot' ? 'uma imagem' : 'um vídeo'}</span>
                  </div>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="linkUrl">URL</Label>
              <Input
                id="linkUrl"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="viewCount" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t('verification.viewCount')}
            </Label>
            <Input
              id="viewCount"
              type="number"
              value={viewCount}
              onChange={(e) => setViewCount(e.target.value)}
              placeholder="Ex: 1500"
            />
          </div>

          {/* AI Pre-validation */}
          {(preview || (proofType === 'link' && linkUrl)) && !aiValidated && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAIValidation}
              disabled={analyzing}
              className="w-full border-primary/30 text-primary hover:bg-primary/5"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  StatusAI analisando...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Validar com StatusAI antes de enviar
                </>
              )}
            </Button>
          )}

          {/* AI Analysis Result */}
          {aiAnalysis && (
            <div className={cn(
              "rounded-lg border p-3 space-y-2",
              aiAnalysis.is_valid_status
                ? "border-primary/30 bg-primary/5"
                : "border-warning/30 bg-warning/5"
            )}>
              <div className="flex items-center gap-2">
                {aiAnalysis.is_valid_status ? (
                  <ShieldCheck className="h-4 w-4 text-primary" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
                <span className="text-sm font-medium">
                  {aiAnalysis.is_valid_status ? 'Status válido' : 'Atenção'}
                </span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  Confiança: {Math.round((aiAnalysis.confidence || 0) * 100)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{aiAnalysis.summary}</p>
              {aiAnalysis.ad_integrity > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Integridade do anúncio</span>
                    <span className="font-medium">{Math.round(aiAnalysis.ad_integrity * 100)}%</span>
                  </div>
                  <Progress value={aiAnalysis.ad_integrity * 100} className="h-1" />
                </div>
              )}
              {aiAnalysis.issues?.length > 0 && (
                <ul className="text-xs text-warning space-y-0.5">
                  {aiAnalysis.issues.map((issue: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <Button 
            onClick={handleSubmit} 
            disabled={uploading || (!file && !linkUrl)}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              t('verification.submit')
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Previous proofs */}
      {proofs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comprovantes Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proofs.map((proof) => (
                <div 
                  key={proof.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    proof.status === 'approved' && "border-success/30 bg-success/5",
                    proof.status === 'rejected' && "border-destructive/30 bg-destructive/5",
                    proof.status === 'pending' && "border-warning/30 bg-warning/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {proof.proof_type === 'screenshot' && <Image className="h-5 w-5 text-muted-foreground" />}
                    {proof.proof_type === 'video' && <Video className="h-5 w-5 text-muted-foreground" />}
                    {proof.proof_type === 'link' && <Link className="h-5 w-5 text-muted-foreground" />}
                    <div>
                      <p className="font-medium text-sm">
                        {proof.file_name || t(`verification.${proof.proof_type}`)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {proof.view_count && `${proof.view_count} visualizações • `}
                        {new Date(proof.submitted_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(proof.status)}
                    <span className="text-sm">{getStatusLabel(proof.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
