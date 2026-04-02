import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  User, Camera, FileText, Zap, CheckCircle, ArrowRight, X, 
  Globe, Shield, TrendingUp, Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  icon: typeof User;
  title: string;
  description: string;
  isComplete: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface OnboardingFlowProps {
  profile: {
    display_name?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    niche?: string | null;
    is_verified?: boolean;
    total_campaigns?: number;
  } | null;
  onAction: (action: string) => void;
  onDismiss: () => void;
}

const ONBOARDING_DISMISSED_KEY = "statusads_onboarding_dismissed";

export const OnboardingFlow = ({ profile, onAction, onDismiss }: OnboardingFlowProps) => {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(ONBOARDING_DISMISSED_KEY);
    if (stored === "true") setDismissed(true);
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: "name",
      icon: User,
      title: "Complete seu perfil",
      description: "Adicione nome, bio e foto para atrair mais anunciantes",
      isComplete: !!(profile?.display_name && profile?.bio),
      actionLabel: "Editar Perfil",
    },
    {
      id: "niche",
      icon: Globe,
      title: "Defina seu nicho",
      description: "Escolha sua categoria para aparecer nas buscas certas",
      isComplete: !!profile?.niche,
      actionLabel: "Definir Nicho",
    },
    {
      id: "avatar",
      icon: Camera,
      title: "Adicione uma foto",
      description: "Perfis com foto recebem 3x mais propostas",
      isComplete: !!profile?.avatar_url,
      actionLabel: "Adicionar Foto",
    },
    {
      id: "first_campaign",
      icon: Zap,
      title: "Aceite sua primeira campanha",
      description: "Comece a monetizar seus Status do WhatsApp",
      isComplete: (profile?.total_campaigns || 0) > 0,
      actionLabel: "Ver Campanhas",
    },
  ];

  const completedSteps = steps.filter(s => s.isComplete).length;
  const progress = (completedSteps / steps.length) * 100;
  const allComplete = completedSteps === steps.length;

  // Auto-highlight next incomplete step
  useEffect(() => {
    const nextIncomplete = steps.findIndex(s => !s.isComplete);
    if (nextIncomplete >= 0) setCurrentHighlight(nextIncomplete);
  }, [profile]);

  if (dismissed || allComplete) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass border-border/40 rounded-xl p-4 md:p-5 relative overflow-hidden"
    >
      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-foreground">
            Comece com tudo! 🚀
          </h3>
          <p className="text-xs text-muted-foreground">
            {completedSteps}/{steps.length} passos concluídos
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-primary">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1.5 mb-4" />

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isHighlighted = i === currentHighlight;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "flex items-start gap-2.5 p-3 rounded-lg border transition-all cursor-pointer",
                step.isComplete
                  ? "bg-primary/5 border-primary/20"
                  : isHighlighted
                    ? "bg-muted/50 border-primary/30 ring-1 ring-primary/20"
                    : "bg-muted/20 border-border/30 hover:border-border/50"
              )}
              onClick={() => !step.isComplete && onAction(step.id)}
            >
              <div className={cn(
                "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                step.isComplete
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {step.isComplete ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-medium",
                  step.isComplete ? "text-primary line-through" : "text-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                  {step.description}
                </p>
                {!step.isComplete && isHighlighted && (
                  <Button size="sm" variant="link" className="h-auto p-0 text-[10px] text-primary mt-1">
                    {step.actionLabel} <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
