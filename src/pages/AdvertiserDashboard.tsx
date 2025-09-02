import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedProfileCard } from "@/components/EnhancedProfileCard";
import { TrustIndicators } from "@/components/TrustIndicators";
import { MetricsCard } from "@/components/MetricsCard";
import { CampaignCard } from "@/components/CampaignCard";
import { SearchFilters } from "@/components/SearchFilters";
import { 
  Plus,
  Target, 
  TrendingUp, 
  Users,
  Eye,
  MessageSquare,
  Settings,
  Bell,
  BarChart3,
  Filter,
  Search,
  Calendar,
  DollarSign
} from "lucide-react";
import { Input } from "@/components/ui/input";

export const AdvertiserDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - replace with real data from Supabase
  const stats = {
    activeCampaigns: 5,
    totalSpent: 12750.00,
    avgEngagement: 4.2,
    totalReach: 45600,
    conversionRate: 3.8,
    partneredCreators: 12
  };

  const campaigns = [
    {
      id: 1,
      title: "Produto de Beleza Natural",
      creator: "@beleza_maria",
      budget: 500,
      spent: 300,
      status: "active" as const,
      reach: 12500,
      engagement: 4.8,
      deadline: "2025-01-15",
      progress: 60
    },
    {
      id: 2,
      title: "App de Fitness",
      creator: "@fit_coach_ana", 
      budget: 800,
      spent: 0,
      status: "pending" as const,
      reach: 0,
      engagement: 0,
      deadline: "2025-01-20",
      progress: 0
    }
  ];

  const topCreators = [
    {
      id: "1",
      display_name: "Maria Beauty",
      niche: "Beleza",
      price_per_post: 150,
      rating: 4.9,
      total_reviews: 24,
      total_campaigns: 18,
      is_verified: true,
      badge_level: "gold",
      avatar_url: "",
      created_at: "2024-01-15T00:00:00Z"
    },
    {
      id: "2", 
      display_name: "Fitness Ana",
      niche: "Fitness",
      price_per_post: 200,
      rating: 4.7,
      total_reviews: 19,
      total_campaigns: 22,
      is_verified: true,
      badge_level: "platinum",
      avatar_url: "",
      created_at: "2024-02-20T00:00:00Z"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'completed': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Painel do Anunciante
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie campanhas e encontre os melhores criadores
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricsCard
            title="Campanhas Ativas"
            value={stats.activeCampaigns}
            icon={Target}
            variant="primary"
            trend={{ value: 25, isPositive: true }}
          />
          
          <MetricsCard
            title="Total Investido"
            value={`R$ ${stats.totalSpent.toFixed(0)}`}
            icon={DollarSign}
            variant="success"
            trend={{ value: 15.2, isPositive: true }}
          />
          
          <MetricsCard
            title="Alcance Total"
            value={stats.totalReach}
            icon={Eye}
            variant="warning"
            subtitle="pessoas impactadas"
          />
          
          <MetricsCard
            title="Engajamento Médio"
            value={`${stats.avgEngagement}%`}
            icon={TrendingUp}
            variant="default"
            trend={{ value: 2.1, isPositive: true }}
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="creators">Criadores</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Campaigns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Campanhas Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaigns.slice(0, 3).map((campaign) => (
                    <div key={campaign.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{campaign.title}</div>
                        <div className="text-sm text-muted-foreground">{campaign.creator}</div>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status === 'active' ? 'Ativa' : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Dados de performance em breve
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trust Indicators */}
            <TrustIndicators />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Suas Campanhas</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Campanha
              </Button>
            </div>

            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={{
                    ...campaign,
                    creator: campaign.creator,
                    id: campaign.id.toString()
                  }}
                  viewType="advertiser"
                  onViewDetails={(camp) => console.log('View details:', camp)}
                  onOpenChat={(camp) => console.log('Open chat:', camp)}
                  onViewAnalytics={(camp) => console.log('View analytics:', camp)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="creators" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Encontrar Criadores</h2>
            </div>

            <SearchFilters 
              onFiltersChange={(filters) => console.log('Filters changed:', filters)}
              showPriceFilter={true}
              showNicheFilter={true}
              showRatingFilter={true}
              showLocationFilter={true}
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topCreators.map((creator) => (
                <EnhancedProfileCard
                  key={creator.id}
                  profile={creator}
                  onSelect={(profile) => console.log('Selected creator:', profile)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Detalhado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Gráficos e métricas detalhadas serão implementados aqui
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};