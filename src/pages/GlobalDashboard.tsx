import { useState, useEffect } from "react";
import { usePlatformStats, type PlatformStats } from "@/hooks/usePlatformStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Zap,
  Eye,
  DollarSign,
  TrendingUp,
  BarChart3,
  Globe,
  Activity,
  CheckCircle2,
  Target,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// PlatformStats type is imported from the hook

const NICHE_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(262, 83%, 58%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(180, 70%, 45%)",
  "hsl(320, 70%, 55%)",
  "hsl(45, 90%, 50%)",
];

const AnimatedNumber = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const formatted = display >= 1000000
    ? `${(display / 1000000).toFixed(1)}M`
    : display >= 1000
    ? `${(display / 1000).toFixed(1)}K`
    : display.toLocaleString("pt-BR");

  return <span>{prefix}{formatted}{suffix}</span>;
};

export const GlobalDashboard = () => {
  const { stats, loading, error } = usePlatformStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-80" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Activity className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground">Erro ao carregar dashboard</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { overview, niche_distribution, activity_timeline } = stats;

  const metricCards = [
    {
      label: "Criadores Ativos",
      value: overview.total_creators,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Campanhas Totais",
      value: overview.total_campaigns,
      icon: Target,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Campanhas Ativas",
      value: overview.active_campaigns,
      icon: Zap,
      color: "text-warning",
      bg: "bg-warning/10",
      pulse: true,
    },
    {
      label: "Concluídas",
      value: overview.completed_campaigns,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Visualizações",
      value: overview.total_views,
      icon: Eye,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Volume Total",
      value: overview.total_campaign_value,
      prefix: "R$ ",
      icon: DollarSign,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Pago a Criadores",
      value: overview.total_paid_to_creators,
      prefix: "R$ ",
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Ticket Médio",
      value: overview.avg_campaign_value,
      prefix: "R$ ",
      icon: BarChart3,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-8 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full mb-3">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Rede Global
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Dashboard de Comando
            </h1>
            <p className="text-muted-foreground mt-1">
              Métricas em tempo real da rede StatusAds Connect
            </p>
          </div>
          <Badge variant="outline" className="text-xs gap-1 self-start md:self-auto">
            <Activity className="h-3 w-3" />
            Atualizado: {new Date(stats.updated_at).toLocaleTimeString("pt-BR")}
          </Badge>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="relative overflow-hidden group hover:shadow-medium transition-shadow">
                <CardContent className="pt-5 pb-4 px-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${card.bg}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    {card.pulse && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-warning" />
                      </span>
                    )}
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    <AnimatedNumber
                      value={card.value}
                      prefix={card.prefix || ""}
                    />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                </CardContent>
                {/* Decorative accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${card.bg} opacity-60`} />
              </Card>
            );
          })}
        </div>

        {/* Completion Rate */}
        <Card>
          <CardContent className="pt-5 pb-4 px-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-foreground">Taxa de Conclusão</span>
              </div>
              <span className="text-sm font-bold text-success">{overview.completion_rate}%</span>
            </div>
            <Progress value={overview.completion_rate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {overview.completed_campaigns} de {overview.total_campaigns} campanhas concluídas com sucesso
            </p>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Activity Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Atividade (últimos 30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activity_timeline.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={activity_timeline}>
                    <defs>
                      <linearGradient id="colorCampaigns" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      labelFormatter={(v) => new Date(v).toLocaleDateString("pt-BR")}
                      formatter={(value: number, name: string) => [
                        name === "campaigns" ? `${value} campanhas` : `R$ ${value}`,
                        name === "campaigns" ? "Campanhas" : "Volume",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="campaigns"
                      stroke="hsl(217, 91%, 60%)"
                      fill="url(#colorCampaigns)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
                  Nenhuma atividade nos últimos 30 dias
                </div>
              )}
            </CardContent>
          </Card>

          {/* Niche Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-accent" />
                Distribuição por Nicho
              </CardTitle>
            </CardHeader>
            <CardContent>
              {niche_distribution.length > 0 ? (
                <div className="flex gap-4">
                  <ResponsiveContainer width="50%" height={240}>
                    <PieChart>
                      <Pie
                        data={niche_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="count"
                        nameKey="name"
                        strokeWidth={2}
                        stroke="hsl(0, 0%, 100%)"
                      >
                        {niche_distribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={NICHE_COLORS[index % NICHE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} criadores`, "Total"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 flex flex-col justify-center space-y-2">
                    {niche_distribution.map((niche, i) => (
                      <div key={niche.name} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: NICHE_COLORS[i % NICHE_COLORS.length] }}
                        />
                        <span className="text-foreground truncate">{niche.name}</span>
                        <span className="text-muted-foreground ml-auto">{niche.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
                  Nenhum dado de nicho disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Volume Timeline */}
        {activity_timeline.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                Volume Financeiro (R$)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activity_timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    labelFormatter={(v) => new Date(v).toLocaleDateString("pt-BR")}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Volume"]}
                  />
                  <Bar dataKey="volume" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <div className="flex items-center justify-center gap-2">
            <Globe className="h-3 w-3" />
            StatusAds Connect — Dashboard de Comando Global
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
