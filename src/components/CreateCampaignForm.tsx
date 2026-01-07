import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Target, 
  DollarSign, 
  Users, 
  FileText,
  Image,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignData {
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: Date | undefined;
  targetNiches: string[];
  requirements: string;
  deliverables: string;
  autoApprove: boolean;
}

interface CreateCampaignFormProps {
  onSubmit?: (data: CampaignData) => void;
  onCancel?: () => void;
}

const niches = [
  "Beleza", "Fitness", "Tecnologia", "Gastronomia", "Viagens", 
  "Moda", "Lifestyle", "Negócios", "Educação", "Entretenimento"
];

const categories = [
  { value: "product", label: "Divulgação de Produto" },
  { value: "service", label: "Divulgação de Serviço" },
  { value: "brand", label: "Awareness de Marca" },
  { value: "event", label: "Evento/Promoção" },
  { value: "app", label: "Download de App" },
];

export const CreateCampaignForm = ({ onSubmit, onCancel }: CreateCampaignFormProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CampaignData>({
    title: "",
    description: "",
    category: "",
    budget: 200,
    deadline: undefined,
    targetNiches: [],
    requirements: "",
    deliverables: "",
    autoApprove: false,
  });

  const totalSteps = 4;

  const handleNicheToggle = (niche: string) => {
    setFormData(prev => ({
      ...prev,
      targetNiches: prev.targetNiches.includes(niche)
        ? prev.targetNiches.filter(n => n !== niche)
        : [...prev.targetNiches, niche]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSubmit?.(formData);
      toast({
        title: "Campanha criada!",
        description: "Sua campanha foi criada com sucesso e está aguardando aprovação.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar campanha",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title && formData.category;
      case 2:
        return formData.budget > 0 && formData.deadline;
      case 3:
        return formData.targetNiches.length > 0;
      case 4:
        return true;
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
                ? "bg-success text-white"
                : step === index + 1
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {step > index + 1 ? <Check className="h-5 w-5" /> : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={cn(
                "w-16 h-1 mx-2",
                step > index + 1 ? "bg-success" : "bg-muted"
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
        <Label>Data Limite *</Label>
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

      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div>
          <Label>Aprovação Automática</Label>
          <p className="text-sm text-muted-foreground">
            Aprovar automaticamente criadores verificados
          </p>
        </div>
        <Switch
          checked={formData.autoApprove}
          onCheckedChange={(checked) => setFormData({ ...formData, autoApprove: checked })}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label>Nichos Alvo *</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Selecione os nichos de criadores que deseja alcançar
        </p>
        <div className="flex flex-wrap gap-2">
          {niches.map((niche) => (
            <Badge
              key={niche}
              variant={formData.targetNiches.includes(niche) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
              onClick={() => handleNicheToggle(niche)}
            >
              {niche}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="requirements">Requisitos para Criadores</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          placeholder="Ex: Mínimo 1000 seguidores, conta verificada..."
          className="mt-2"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="deliverables">O que o criador deve entregar</Label>
        <Textarea
          id="deliverables"
          value={formData.deliverables}
          onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
          placeholder="Ex: 3 stories com link, 1 post no feed mencionando a marca..."
          className="mt-2"
          rows={4}
        />
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
            <span className="font-medium text-success">R$ {formData.budget}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prazo:</span>
            <span className="font-medium">
              {formData.deadline ? format(formData.deadline, "dd/MM/yyyy") : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nichos:</span>
            <span className="font-medium">{formData.targetNiches.join(", ") || "-"}</span>
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
            {step === 3 && "Selecione o público-alvo"}
            {step === 4 && "Revise e finalize"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

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
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
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
