import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, AreaChart, Area, ComposedChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, Users, Target, MousePointerClick, Share2, MessageSquare, DollarSign } from "lucide-react";

interface AnalyticsData {
  date: string;
  impressions: number;
  clicks: number;
  engagement: number;
  conversions: number;
}

interface CampaignPerformance {
  name: string;
  reach: number;
  engagement: number;
  cost: number;
  roi: number;
}

const defaultData: AnalyticsData[] = [
  { date: "01/01", impressions: 1200, clicks: 48, engagement: 4.0, conversions: 12 },
  { date: "02/01", impressions: 1800, clicks: 90, engagement: 5.0, conversions: 18 },
  { date: "03/01", impressions: 1400, clicks: 56, engagement: 4.0, conversions: 14 },
  { date: "04/01", impressions: 2200, clicks: 132, engagement: 6.0, conversions: 26 },
  { date: "05/01", impressions: 2800, clicks: 168, engagement: 6.0, conversions: 34 },
  { date: "06/01", impressions: 2100, clicks: 105, engagement: 5.0, conversions: 21 },
  { date: "07/01", impressions: 3200, clicks: 224, engagement: 7.0, conversions: 45 },
];

const campaignPerformance: CampaignPerformance[] = [
  { name: "Beleza Natural", reach: 12500, engagement: 4.8, cost: 300, roi: 280 },
  { name: "Fitness App", reach: 8900, engagement: 3.9, cost: 200, roi: 150 },
  { name: "Curso Online", reach: 15600, engagement: 5.2, cost: 450, roi: 320 },
  { name: "Tech Product", reach: 6200, engagement: 3.1, cost: 180, roi: 90 },
];

const chartConfig = {
  impressions: {
    label: "Impressões",
    color: "hsl(var(--primary))",
  },
  clicks: {
    label: "Cliques",
    color: "hsl(var(--success))",
  },
  engagement: {
    label: "Engajamento",
    color: "hsl(var(--warning))",
  },
  conversions: {
    label: "Conversões",
    color: "hsl(var(--accent))",
  },
};

export const AnalyticsDashboard = () => {
  const totalImpressions = defaultData.reduce((acc, d) => acc + d.impressions, 0);
  const totalClicks = defaultData.reduce((acc, d) => acc + d.clicks, 0);
  const avgEngagement = (defaultData.reduce((acc, d) => acc + d.engagement, 0) / defaultData.length).toFixed(1);
  const totalConversions = defaultData.reduce((acc, d) => acc + d.conversions, 0);
  const ctr = ((totalClicks / totalImpressions) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impressões</p>
                <p className="text-2xl font-bold">{totalImpressions.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Eye className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Badge variant="secondary" className="mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cliques</p>
                <p className="text-2xl font-bold">{totalClicks.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-success/10 p-2 rounded-full">
                <MousePointerClick className="h-5 w-5 text-success" />
              </div>
            </div>
            <Badge variant="secondary" className="mt-2">
              CTR: {ctr}%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engajamento</p>
                <p className="text-2xl font-bold">{avgEngagement}%</p>
              </div>
              <div className="bg-warning/10 p-2 rounded-full">
                <Share2 className="h-5 w-5 text-warning" />
              </div>
            </div>
            <Badge variant="secondary" className="mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.3%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversões</p>
                <p className="text-2xl font-bold">{totalConversions}</p>
              </div>
              <div className="bg-accent/10 p-2 rounded-full">
                <Target className="h-5 w-5 text-accent" />
              </div>
            </div>
            <Badge variant="secondary" className="mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +22.1%
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={defaultData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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

      {/* Campaign Performance */}
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
                        {campaign.reach.toLocaleString('pt-BR')}
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

      {/* Engagement Over Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engajamento por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defaultData}>
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
            <CardTitle>Conversões por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={defaultData}>
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
    </div>
  );
};
