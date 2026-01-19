import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useProfiles } from "@/hooks/useProfiles";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Target, 
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Loader2,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateCampaignFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
}

const categories = [
  { value: "product", label: "Divulgação de Produto" },
  { value: "service", label: "Divulgação de Serviço" },
  { value: "brand", label: "Awareness de Marca" },
  { value: "event", label: "Evento/Promoção" },
  { value: "app", label: "Download de App" },
];

export const CreateCampaignForm = ({ onSubmit, onCancel }: CreateCampaignFormProps) => {
  const { createCampaign, creating } = useCampaigns();
  const { profiles, loading: loadingProfiles } = useProfiles();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: 200,
    deadline: undefined as Date | undefined,
    selectedCreatorId: "",
  });

  const totalSteps = 3;

  const handleSubmit = async () => {
    if (!formData.selectedCreatorId) return;
    
    try {
      await createCampaign({
        title: formData.title,
        description: formData.description,
        price: formData.budget,
        creator_id: formData.selectedCreatorId,
      });
      onSubmit?.();
    } catch (error) {
      // Error handled in hook
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title && formData.category;
      case 2:
        return formData.budget > 0;
      case 3:
        return formData.selectedCreatorId;
      default:
        return false;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors",
              step > index + 1
                ? "bg-primary text-primary-foreground"
                : step === index + 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {step > index + 1 ? <Check className="h-5 w-5" /> : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={cn(
                "w-16 h-1 mx-2",
                step > index + 1 ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Título da Campanha *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Lançamento Novo Produto de Skincare"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="category">Categoria *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva os objetivos e detalhes da campanha..."
          className="mt-2"
          rows={4}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label>Orçamento: R$ {formData.budget}</Label>
        <div className="mt-4 px-2">
          <Slider
            value={[formData.budget]}
            onValueChange={(value) => setFormData({ ...formData, budget: value[0] })}
            min={50}
            max={5000}
            step={50}
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>R$ 50</span>
          <span>R$ 5.000</span>
        </div>
      </div>

      <div>
        <Label>Data Limite (opcional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal mt-2",
                !formData.deadline && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.deadline
                ? format(formData.deadline, "PPP", { locale: ptBR })
                : "Selecione uma data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.deadline}
              onSelect={(date) => setFormData({ ...formData, deadline: date })}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label>Selecione um Criador *</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Escolha o criador que receberá sua proposta
        </p>
        
        {loadingProfiles ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            Nenhum criador disponível no momento
          </div>
        ) : (
          <div className="grid gap-3 max-h-[300px] overflow-y-auto">
            {profiles.slice(0, 10).map((profile) => (
              <div
                key={profile.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  formData.selectedCreatorId === profile.profile_id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                )}
                onClick={() => setFormData({ ...formData, selectedCreatorId: profile.profile_id || profile.id })}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{profile.display_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {profile.niche && <Badge variant="secondary">{profile.niche}</Badge>}
                    {profile.price_range && <span>{profile.price_range}</span>}
                  </div>
                </div>
                {formData.selectedCreatorId === profile.profile_id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Resumo da Campanha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Título:</span>
            <span className="font-medium">{formData.title || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Categoria:</span>
            <span className="font-medium">
              {categories.find(c => c.value === formData.category)?.label || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Orçamento:</span>
            <span className="font-medium text-primary">R$ {formData.budget}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prazo:</span>
            <span className="font-medium">
              {formData.deadline ? format(formData.deadline, "dd/MM/yyyy") : "Sem prazo"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Criar Nova Campanha
          </CardTitle>
          <CardDescription>
            {step === 1 && "Defina as informações básicas da sua campanha"}
            {step === 2 && "Configure o orçamento e prazo"}
            {step === 3 && "Selecione o criador e revise"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : onCancel?.()}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {step === 1 ? "Cancelar" : "Voltar"}
            </Button>

            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={creating || !canProceed()}>
                {creating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Campanha
                  </div>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Dialog wrapper for easy use
export const CreateCampaignDialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Criar Campanha</DialogTitle>
        </DialogHeader>
        <CreateCampaignForm onCancel={() => setOpen(false)} onSubmit={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
