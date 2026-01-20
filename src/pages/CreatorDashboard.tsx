import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressCTA } from "@/components/EnhancedCTA";
import { TrustIndicators } from "@/components/TrustIndicators";
import { MetricsCard } from "@/components/MetricsCard";
import { CampaignCard } from "@/components/CampaignCard";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { EarningsChart } from "@/components/EarningsChart";
import { NotificationButton } from "@/components/NotificationsPanel";
import { useProfile } from "@/hooks/useProfile";
import { useCampaigns } from "@/hooks/useCampaigns";
import { 
  DollarSign, 
  TrendingUp, 
  Star, 
  Eye,
  Settings,
  Award,
  Target,
  Loader2
} from "lucide-react";

export const CreatorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { profile, loading: profileLoading } = useProfile();
  const { campaigns, loading: campaignsLoading } = useCampaigns();

  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'pending');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');
  
  const totalEarnings = completedCampaigns.reduce((sum, c) => sum + Number(c.price), 0);
  const monthlyEarnings = completedCampaigns
    .filter(c => {
      const completedDate = c.completed_at ? new Date(c.completed_at) : null;
      if (!completedDate) return false;
      const now = new Date();
      return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, c) => sum + Number(c.price), 0);

  if (profileLoading || campaignsLoading) {
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
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Painel do Criador</h1>
            <p className="text-muted-foreground mt-1">Olá, {profile?.display_name || 'Criador'}! Gerencie suas campanhas e monitore seus ganhos</p>
          </div>
          <div className="flex gap-2">
            <NotificationButton />
            <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" />Configurações</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricsCard title="Total Ganho" value={`R$ ${totalEarnings.toFixed(2)}`} icon={DollarSign} variant="success" trend={{ value: 12.5, isPositive: true }} />
          <MetricsCard title="Este Mês" value={`R$ ${monthlyEarnings.toFixed(2)}`} icon={TrendingUp} variant="primary" trend={{ value: 8.3, isPositive: true }} />
          <MetricsCard title="Campanhas Ativas" value={activeCampaigns.length} icon={Target} variant="warning" subtitle="Em andamento" />
          <MetricsCard title="Avaliação Média" value={profile?.rating || 0} icon={Star} variant="default" subtitle={`${profile?.total_reviews || 0} avaliações`} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="earnings">Ganhos</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Performance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm">Taxa de Resposta</span><span className="font-semibold text-success">96%</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm">Campanhas Concluídas</span><span className="font-semibold">{completedCampaigns.length}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm">Visualizações do Perfil</span><span className="font-semibold">{profile?.total_campaigns || 0}</span></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Próximos Passos</CardTitle></CardHeader>
                <CardContent><ProgressCTA currentStep={profile?.bio ? 3 : 2} totalSteps={5} nextAction="Completar Perfil" onClick={() => setActiveTab("profile")} /></CardContent>
              </Card>
            </div>
            <TrustIndicators />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Suas Campanhas</h2>
              <Button><Eye className="h-4 w-4 mr-2" />Ver Disponíveis</Button>
            </div>
            {campaigns.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Você ainda não tem campanhas. Aguarde propostas de anunciantes!</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <CampaignCard 
                    key={campaign.id} 
                    campaign={{ 
                      id: campaign.id, 
                      title: campaign.title, 
                      advertiser: "Anunciante", 
                      price: Number(campaign.price), 
                      status: campaign.status as 'active' | 'pending' | 'completed',
                      deadline: campaign.created_at || '',
                      progress: campaign.status === 'completed' ? 100 : campaign.status === 'active' ? 50 : 0
                    }} 
                    viewType="creator" 
                    onViewDetails={() => {}} 
                    onOpenChat={() => {}} 
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="earnings"><EarningsChart /></TabsContent>

          <TabsContent value="profile"><ProfileEditForm /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};