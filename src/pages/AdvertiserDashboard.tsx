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
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { CreateCampaignDialog } from "@/components/CreateCampaignForm";
import { NotificationButton } from "@/components/NotificationsPanel";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useProfiles } from "@/hooks/useProfiles";
import { Plus, Target, TrendingUp, Eye, Settings, DollarSign, Loader2 } from "lucide-react";

export const AdvertiserDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { profiles, loading: profilesLoading } = useProfiles();

  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'pending');
  const totalSpent = campaigns.filter(c => c.status === 'completed').reduce((sum, c) => sum + Number(c.price), 0);

  const getStatusColor = (status: string) => {
    switch (status) { 
      case 'active': return 'bg-success'; 
      case 'pending': return 'bg-warning'; 
      case 'completed': return 'bg-primary'; 
      default: return 'bg-muted'; 
    }
  };

  if (campaignsLoading || profilesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Painel do Anunciante</h1>
            <p className="text-muted-foreground mt-1">Gerencie campanhas e encontre os melhores criadores</p>
          </div>
          <div className="flex gap-2">
            <CreateCampaignDialog><Button><Plus className="h-4 w-4 mr-2" />Nova Campanha</Button></CreateCampaignDialog>
            <NotificationButton />
            <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" />Configurações</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricsCard title="Campanhas Ativas" value={activeCampaigns.length} icon={Target} variant="primary" trend={{ value: 25, isPositive: true }} />
          <MetricsCard title="Total Investido" value={`R$ ${totalSpent.toFixed(0)}`} icon={DollarSign} variant="success" trend={{ value: 15.2, isPositive: true }} />
          <MetricsCard title="Criadores Disponíveis" value={profiles.length} icon={Eye} variant="warning" subtitle="na plataforma" />
          <MetricsCard title="Campanhas Totais" value={campaigns.length} icon={TrendingUp} variant="default" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="creators">Criadores</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Campanhas Recentes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {campaigns.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Nenhuma campanha ainda</p>
                  ) : (
                    campaigns.slice(0, 3).map((campaign) => (
                      <div key={campaign.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div><div className="font-medium">{campaign.title}</div><div className="text-sm text-muted-foreground">R$ {Number(campaign.price).toFixed(2)}</div></div>
                        <Badge className={getStatusColor(campaign.status || 'pending')}>{campaign.status === 'active' ? 'Ativa' : campaign.status === 'completed' ? 'Concluída' : 'Pendente'}</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Top Performers</CardTitle></CardHeader><CardContent><TrustIndicators /></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Suas Campanhas</h2>
              <CreateCampaignDialog><Button><Plus className="h-4 w-4 mr-2" />Nova Campanha</Button></CreateCampaignDialog>
            </div>
            {campaigns.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Você ainda não tem campanhas. Crie sua primeira campanha!</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <CampaignCard 
                    key={campaign.id} 
                    campaign={{ 
                      id: campaign.id, 
                      title: campaign.title, 
                      creator: "Criador", 
                      budget: Number(campaign.price),
                      spent: campaign.status === 'completed' ? Number(campaign.price) : 0,
                      status: campaign.status as 'active' | 'pending' | 'completed',
                      reach: 0,
                      engagement: 0,
                      deadline: campaign.created_at || '',
                      progress: campaign.status === 'completed' ? 100 : campaign.status === 'active' ? 50 : 0
                    }} 
                    viewType="advertiser" 
                    onViewDetails={() => {}} 
                    onOpenChat={() => {}} 
                    onViewAnalytics={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="creators" className="space-y-6">
            <h2 className="text-xl font-semibold">Encontrar Criadores</h2>
            <SearchFilters onFiltersChange={() => {}} showPriceFilter showNicheFilter showRatingFilter showLocationFilter />
            {profiles.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum criador disponível no momento.</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((creator) => (
                  <EnhancedProfileCard 
                    key={creator.id} 
                    profile={{
                      id: creator.id,
                      display_name: creator.display_name,
                      niche: creator.niche || '',
                      price_range: creator.price_range || '',
                      rating: Number(creator.rating) || 0,
                      total_reviews: creator.total_reviews || 0,
                      total_campaigns: creator.total_campaigns || 0,
                      is_verified: creator.is_verified || false,
                      badge_level: creator.badge_level || 'bronze',
                      created_at: creator.created_at || ''
                    }} 
                    onSelect={() => {}} 
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics"><AnalyticsDashboard /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};