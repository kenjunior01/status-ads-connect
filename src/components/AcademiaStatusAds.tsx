import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  Camera, 
  BarChart3, 
  Palette, 
  Target, 
  Clock, 
  CheckCircle2,
  Play,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: React.ReactNode;
  category: "creator" | "advertiser";
  difficulty: "iniciante" | "intermediário" | "avançado";
  completed: boolean;
  tips: string[];
}

const lessons: Lesson[] = [
  {
    id: "1",
    title: "Como tirar fotos de Status perfeitas",
    description: "Aprenda técnicas de iluminação, composição e enquadramento para criar status que convertem.",
    duration: "5 min",
    icon: <Camera className="h-5 w-5" />,
    category: "creator",
    difficulty: "iniciante",
    completed: false,
    tips: [
      "Use luz natural sempre que possível",
      "Mantenha o produto no centro da imagem",
      "Use fundo limpo e sem distrações",
      "Adicione texto curto e legível"
    ]
  },
  {
    id: "2",
    title: "Maximize seus ganhos por campanha",
    description: "Estratégias para aumentar seu CPV e conquistar campanhas premium.",
    duration: "8 min",
    icon: <BarChart3 className="h-5 w-5" />,
    category: "creator",
    difficulty: "intermediário",
    completed: false,
    tips: [
      "Publique nos horários de maior audiência (18h-21h)",
      "Mantenha taxa de engajamento acima de 3%",
      "Responda rápido às propostas dos anunciantes",
      "Suba de nível no ranking para taxas melhores"
    ]
  },
  {
    id: "3",
    title: "Criando artes que convertem",
    description: "Design de peças publicitárias que geram cliques e resultados reais.",
    duration: "6 min",
    icon: <Palette className="h-5 w-5" />,
    category: "advertiser",
    difficulty: "iniciante",
    completed: false,
    tips: [
      "Use cores contrastantes para o CTA",
      "Textos curtos: máximo 2 linhas",
      "Inclua prova social quando possível",
      "Teste A/B com variações de imagem"
    ]
  },
  {
    id: "4",
    title: "Segmentação avançada de público",
    description: "Como encontrar os criadores certos para atingir o público ideal da sua marca.",
    duration: "7 min",
    icon: <Target className="h-5 w-5" />,
    category: "advertiser",
    difficulty: "avançado",
    completed: false,
    tips: [
      "Filtre por nicho + região para maior relevância",
      "Priorize criadores com taxa de engajamento real",
      "Use o Smart Matchmaking para sugestões por IA",
      "Diversifique entre micro e macro influenciadores"
    ]
  },
];

export const AcademiaStatusAds = () => {
  const [activeTab, setActiveTab] = useState<"creator" | "advertiser">("creator");
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const filteredLessons = lessons.filter(l => l.category === activeTab);
  const completedCount = completedLessons.length;
  const totalCount = lessons.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleComplete = (id: string) => {
    setCompletedLessons(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "iniciante": return "bg-success/10 text-success";
      case "intermediário": return "bg-warning/10 text-warning";
      case "avançado": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-primary">
          <GraduationCap className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Academia StatusAds</h2>
          <p className="text-sm text-muted-foreground">Aprenda, evolua e ganhe mais</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="glass border-border/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Seu progresso</span>
            <span className="text-xs text-muted-foreground">{completedCount}/{totalCount} lições</span>
          </div>
          <Progress value={progress} className="h-2" />
          {completedCount > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <Star className="h-3.5 w-3.5 text-warning fill-warning" />
              <span className="text-xs text-muted-foreground">
                +{completedCount * 50} XP ganhos com a Academia
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "creator" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("creator")}
          className="gap-1.5"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Para Criadores
        </Button>
        <Button
          variant={activeTab === "advertiser" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("advertiser")}
          className="gap-1.5"
        >
          <Target className="h-3.5 w-3.5" />
          Para Anunciantes
        </Button>
      </div>

      {/* Lessons */}
      <div className="space-y-3">
        {filteredLessons.map((lesson) => {
          const isExpanded = expandedLesson === lesson.id;
          const isCompleted = completedLessons.includes(lesson.id);

          return (
            <Card 
              key={lesson.id}
              className={cn(
                "glass border-border/30 transition-all duration-200 cursor-pointer",
                isCompleted && "border-success/30 bg-success/5",
                isExpanded && "ring-1 ring-primary/20"
              )}
              onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    isCompleted ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : lesson.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={cn(
                        "font-semibold text-sm",
                        isCompleted ? "text-success line-through" : "text-foreground"
                      )}>
                        {lesson.title}
                      </h3>
                      <Badge className={cn("text-[10px] shrink-0", getDifficultyColor(lesson.difficulty))}>
                        {lesson.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{lesson.description}</p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {lesson.duration}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Lightbulb className="h-3 w-3" />
                        {lesson.tips.length} dicas
                      </div>
                    </div>

                    {/* Expanded tips */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5 text-warning" />
                          Dicas Práticas
                        </p>
                        {lesson.tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <ArrowRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                            <span>{tip}</span>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant={isCompleted ? "outline" : "default"}
                          className="w-full mt-2 gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComplete(lesson.id);
                          }}
                        >
                          {isCompleted ? (
                            <>Desmarcar como concluída</>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Marcar como concluída (+50 XP)
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
