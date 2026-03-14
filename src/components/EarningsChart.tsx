import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  earnings: {
    label: "Ganhos",
    color: "hsl(var(--primary))",
  },
  campaigns: {
    label: "Campanhas",
    color: "hsl(var(--success))",
  },
};

const CATEGORY_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--accent))",
];

export const EarningsChart = () => {
  const { campaigns, loading } = useCampaigns();

  const { monthlyData, categoryData, totalEarnings, monthlyGrowth } = useMemo(() => {
    const completed = campaigns.filter(c => c.status === 'completed');
    const total = completed.reduce((sum, c) => sum + Number(c.price), 0);

    // Group by month
    const byMonth: Record<string, { earnings: number; campaigns: number }> = {};
    completed.forEach(c => {
      const date = c.completed_at ? new Date(c.completed_at) : c.created_at ? new Date(c.created_at) : new Date();
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[key]) byMonth[key] = { earnings: 0, campaigns: 0 };
      byMonth[key].earnings += Number(c.price);
      byMonth[key].campaigns += 1;
    });

    const months = Object.keys(byMonth).sort();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data = months.map(key => {
      const [, m] = key.split('-');
      return {
        month: monthNames[parseInt(m) - 1],
        earnings: byMonth[key].earnings,
        campaigns: byMonth[key].campaigns,
      };
    });

    // Growth
    let growth = 0;
    if (data.length >= 2) {
      const last = data[data.length - 1].earnings;
      const prev = data[data.length - 2].earnings;
      growth = prev > 0 ? ((last - prev) / prev) * 100 : 0;
    }

    // Category distribution from campaign titles/descriptions (simple heuristic)
    const categories: Record<string, number> = {};
    campaigns.forEach(c => {
      const text = `${c.title} ${c.description || ''}`.toLowerCase();
      if (text.match(/beleza|beauty|moda|fashion/)) categories['Beleza'] = (categories['Beleza'] || 0) + 1;
      else if (text.match(/fitness|saúde|health|gym/)) categories['Fitness'] = (categories['Fitness'] || 0) + 1;
      else if (text.match(/tech|tecnologia|app|software/)) categories['Tech'] = (categories['Tech'] || 0) + 1;
      else categories['Outros'] = (categories['Outros'] || 0) + 1;
    });
    const totalCats = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
    const catData = Object.entries(categories).map(([name, count], i) => ({
      name,
      value: Math.round((count / totalCats) * 100),
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

    return {
      monthlyData: data,
      categoryData: catData.length > 0 ? catData : [{ name: 'Sem dados', value: 100, color: CATEGORY_COLORS[0] }],
      totalEarnings: total,
      monthlyGrowth: Math.round(growth * 10) / 10,
    };
  }, [campaigns]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-[360px]" />
      </div>
    );
  }

  const isPositiveGrowth = monthlyGrowth > 0;
  const totalCampaigns = campaigns.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ganho</p>
                <p className="text-2xl font-bold">R$ {totalEarnings.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-primary/20 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crescimento Mensal</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{Math.abs(monthlyGrowth)}%</p>
                  {monthlyData.length >= 2 && (
                    <Badge variant={isPositiveGrowth ? "default" : "destructive"} className="flex items-center gap-1">
                      {isPositiveGrowth ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {isPositiveGrowth ? "Alta" : "Baixa"}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="bg-success/20 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Campanhas</p>
                <p className="text-2xl font-bold">{totalCampaigns}</p>
              </div>
              <div className="bg-warning/20 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      {monthlyData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Ganhos</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEarnings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum dado de ganhos ainda. Complete campanhas para ver o histórico.</p>
        </Card>
      )}

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaigns per Month */}
        {monthlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campanhas por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis 
                      dataKey="month" 
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
                      dataKey="campaigns" 
                      fill="hsl(var(--success))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Earnings by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {category.name} ({category.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
