import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, AreaChart, Area, ComposedChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, Target, MousePointerClick, Share2 } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  impressions: {
    label: "Visualizações",
    color: "hsl(var(--primary))",
  },
  clicks: {
    label: "Campanhas",
    color: "hsl(var(--success))",
  },
  engagement: {
    label: "Engajamento",
    color: "hsl(var(--warning))",
  },
  conversions: {
    label: "Concluídas",
    color: "hsl(var(--accent))",
  },
};

export const AnalyticsDashboard = () => {
  const { campaigns, loading } = useCampaigns();

  const { timelineData, campaignPerformance, kpis } = useMemo(() => {
    // Group campaigns by week
    const byWeek: Record<string, { total: number; completed: number; value: number }> = {};
    campaigns.forEach(c => {
      const date = c.created_at ? new Date(c.created_at) : new Date();
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!byWeek[key]) byWeek[key] = { total: 0, completed: 0, value: 0 };
      byWeek[key].total += 1;
      if (c.status === 'completed') byWeek[key].completed += 1;
      byWeek[key].value += Number(c.price);
    });

    const weeks = Object.keys(byWeek).sort();
    const timeline = weeks.map(key => ({
      date: new Date(key).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      impressions: byWeek[key].value,
      clicks: byWeek[key].total,
      engagement: byWeek[key].total > 0 ? Math.round((byWeek[key].completed / byWeek[key].total) * 100) : 0,
      conversions: byWeek[key].completed,
    }));

    // Campaign performance list
    const perf = campaigns
      .filter(c => c.status === 'completed' || c.status === 'active')
      .slice(0, 5)
      .map(c => ({
        name: c.title,
        reach: Number(c.actual_views) || 0,
        engagement: Number(c.actual_views) > 0 ? Math.round((Number(c.actual_views) / (Number(c.expected_views) || 1)) * 100) : 0,
        cost: Number(c.price),
        roi: Number(c.actual_views) > 0 ? Math.round(((Number(c.actual_views) * (Number(c.cpv_rate) || 0.01)) / Number(c.price)) * 100) : 0,
      }));

    const totalValue = campaigns.reduce((s, c) => s + Number(c.price), 0);
    const totalCompleted = campaigns.filter(c => c.status === 'completed').length;
    const completionRate = campaigns.length > 0 ? ((totalCompleted / campaigns.length) * 100).toFixed(1) : '0';

    return {
      timelineData: timeline,
      campaignPerformance: perf,
      kpis: {
        totalValue,
        totalCampaigns: campaigns.length,
        completionRate,
        totalCompleted,
      },
    };
  }, [campaigns]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-[360px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Volume Total</p>
                <p className="text-2xl font-bold">R$ {kpis.totalValue.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Eye className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Campanhas</p>
                <p className="text-2xl font-bold">{kpis.totalCampaigns}</p>
              </div>
              <div className="bg-success/10 p-2 rounded-full">
                <MousePointerClick className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
                <p className="text-2xl font-bold">{kpis.completionRate}%</p>
              </div>
              <div className="bg-warning/10 p-2 rounded-full">
                <Share2 className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">{kpis.totalCompleted}</p>
              </div>
              <div className="bg-accent/10 p-2 rounded-full">
                <Target className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Performance Chart */}
      {timelineData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Performance Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="impressions"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorImpressions)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="clicks"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--success))", strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma campanha ainda. Crie campanhas para ver a performance.</p>
        </Card>
      )}

      {/* Campaign Performance */}
      {campaignPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance por Campanha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignPerformance.map((campaign, index) => (
                <div 
                  key={campaign.name}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary font-bold w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {campaign.reach.toLocaleString('pt-BR')} views
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {campaign.engagement}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-success">ROI: {campaign.roi}%</p>
                    <p className="text-sm text-muted-foreground">
                      Investido: R$ {campaign.cost}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engagement Over Time */}
      {timelineData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conclusão por Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="engagement" 
                      fill="hsl(var(--warning))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campanhas Concluídas por Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="conversions"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
