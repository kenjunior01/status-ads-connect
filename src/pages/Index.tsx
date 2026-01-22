import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EnhancedProfileCard } from "@/components/EnhancedProfileCard";
import { TrustIndicators, SocialProof, UrgencyCounter } from "@/components/TrustIndicators";
import { EnhancedCTA, FloatingCTA } from "@/components/EnhancedCTA";
import { useProfiles } from "@/hooks/useProfiles";
import { Search, Users, MessageSquare, DollarSign, Star, TrendingUp, BarChart3, PlusCircle, FileText, Settings, Menu, X, Zap, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IndexProps {
  onNavigate?: (page: string) => void;
}

const Index = ({ onNavigate }: IndexProps) => {
  const { toast } = useToast();
  const { profiles, loading, getFeaturedProfiles, getNewProfiles, getDiscoverProfiles } = useProfiles();
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [showAllNew, setShowAllNew] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileSelect = (profile: any) => {
    toast({
      title: "Perfil selecionado!",
      description: `Você clicou no perfil de ${profile.display_name}`,
    });
  };

  const ControlPanel = ({ userType }: { userType: 'creator' | 'advertiser' | 'admin' }) => {
    const panels = {
      creator: {
        title: "Painel do Criador",
        description: "Transforme seus stories em renda",
        gradient: "bg-gradient-success",
        actions: [
          { icon: PlusCircle, label: "Criar Perfil", color: "bg-primary hover:bg-primary-hover" },
          { icon: BarChart3, label: "Meus Ganhos", color: "bg-success hover:bg-success-glow" },
          { icon: DollarSign, label: "Sacar Dinheiro", color: "bg-accent hover:bg-accent/90" },
          { icon: Settings, label: "Configurações", color: "bg-muted hover:bg-muted/80" }
        ]
      },
      advertiser: {
        title: "Painel do Anunciante", 
        description: "Encontre o criador perfeito",
        gradient: "bg-gradient-primary",
        actions: [
          { icon: Search, label: "Buscar Criadores", color: "bg-primary hover:bg-primary-hover" },
          { icon: FileText, label: "Minhas Campanhas", color: "bg-success hover:bg-success-glow" },
          { icon: BarChart3, label: "Relatórios", color: "bg-accent hover:bg-accent/90" },
          { icon: Settings, label: "Configurações", color: "bg-muted hover:bg-muted/80" }
        ]
      },
      admin: {
        title: "Painel Admin",
        description: "Gerencie a plataforma",
        gradient: "bg-gradient-hero",
        actions: [
          { icon: Users, label: "Usuários", color: "bg-primary hover:bg-primary-hover" },
          { icon: BarChart3, label: "Analytics", color: "bg-success hover:bg-success-glow" },
          { icon: Star, label: "Moderação", color: "bg-warning hover:bg-warning/90" },
          { icon: Settings, label: "Sistema", color: "bg-muted hover:bg-muted/80" }
        ]
      }
    };

    const panel = panels[userType];

    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-medium hover:shadow-strong transition-all duration-300 group">
        <div className={`w-full h-2 rounded-full mb-4 ${panel.gradient}`}></div>
        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {panel.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">{panel.description}</p>
        <div className="grid grid-cols-2 gap-3">
          {panel.actions.map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white rounded-lg p-4 text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-medium flex items-center justify-center gap-2`}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">Carregando criadores incríveis...</p>
            <p className="text-sm text-muted-foreground">Preparando as melhores oportunidades para você</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Trust Indicators Section */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <TrustIndicators />
        </div>
      </section>

      {/* Featured Profiles */}
      {getFeaturedProfiles().length > 0 && (
        <section id="featured" className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Star className="h-6 w-6 text-warning fill-warning" />
                <h3 className="text-3xl font-bold text-foreground">Criadores em Destaque</h3>
                <Star className="h-6 w-6 text-warning fill-warning" />
              </div>
              <p className="text-muted-foreground">Os melhores criadores da plataforma • Verificados e avaliados</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">🔥 Mais procurados esta semana</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getFeaturedProfiles().slice(0, showAllFeatured ? 24 : 6).map((profile) => (
                <EnhancedProfileCard 
                  key={profile.id} 
                  profile={profile} 
                  onSelect={handleProfileSelect}
                />
              ))}
            </div>
            {getFeaturedProfiles().length > 6 && !showAllFeatured && (
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowAllFeatured(true)}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Ver Mais Criadores ({getFeaturedProfiles().length - 6} restantes)
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Urgency Counter */}
      <section className="py-8 px-4 bg-card">
        <div className="max-w-4xl mx-auto">
          <UrgencyCounter endTime={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} />
        </div>
      </section>

      {/* New Profiles */}
      {getNewProfiles().length > 0 && (
        <section id="new" className="py-12 px-4 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                <h3 className="text-3xl font-bold text-foreground">Novos Talentos</h3>
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              </div>
              <p className="text-muted-foreground">Descubra os mais novos criadores • Preços especiais de lançamento</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getNewProfiles().slice(0, showAllNew ? 12 : 6).map((profile) => (
                <EnhancedProfileCard 
                  key={profile.id} 
                  profile={profile} 
                  onSelect={handleProfileSelect}
                />
              ))}
            </div>
            {getNewProfiles().length > 6 && !showAllNew && (
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowAllNew(true)}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Ver Mais Novos Talentos ({getNewProfiles().length - 6} restantes)
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Social Proof Section */}
      <section className="py-12 px-4 bg-card">
        <div className="max-w-5xl mx-auto">
          <SocialProof />
        </div>
      </section>

      {/* Discover Section */}
      {getDiscoverProfiles().length > 0 && (
        <section id="discover" className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-foreground">Descubra Mais Criadores</h3>
              <p className="text-muted-foreground">Explore diferentes nichos e encontre o criador perfeito</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getDiscoverProfiles().map((profile) => (
                <EnhancedProfileCard 
                  key={profile.id} 
                  profile={profile} 
                  onSelect={handleProfileSelect}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero Section - Moved below listings */}
      <section className="py-20 px-4 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Transforme seus Status em Renda
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in">
            A primeira plataforma do Brasil que conecta você com empresas que querem anunciar nos seus status do WhatsApp.
          </p>
          <div className="animate-fade-in">
            <EnhancedCTA variant="hero" onClick={() => onNavigate?.('auth')} />
          </div>
          
          {/* Added urgency element */}
          <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full">
            <Clock className="h-4 w-4" />
            <span className="text-sm">⚡ Mais de 2.000 criadores já estão ganhando</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Números da Plataforma</h3>
            <p className="text-muted-foreground text-lg">Resultados que comprovam nosso sucesso</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-primary/10 p-6 rounded-xl mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="h-10 w-10 mx-auto text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">5.2k+</h3>
              <p className="text-muted-foreground">Usuários Ativos</p>
            </div>
            <div className="text-center group">
              <div className="bg-success/10 p-6 rounded-xl mb-4 group-hover:bg-success/20 transition-colors">
                <DollarSign className="h-10 w-10 mx-auto text-success" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">R$ 2.5M+</h3>
              <p className="text-muted-foreground">Pagos aos Usuários</p>
            </div>
            <div className="text-center group">
              <div className="bg-warning/10 p-6 rounded-xl mb-4 group-hover:bg-warning/20 transition-colors">
                <Star className="h-10 w-10 mx-auto text-warning" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">4.9★</h3>
              <p className="text-muted-foreground">Avaliação Média</p>
            </div>
            <div className="text-center group">
              <div className="bg-accent/10 p-6 rounded-xl mb-4 group-hover:bg-accent/20 transition-colors">
                <TrendingUp className="h-10 w-10 mx-auto text-accent" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">25k+</h3>
              <p className="text-muted-foreground">Anúncios Realizados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Control Panels */}
      <section id="controls" className="py-16 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Painéis de Controle</h3>
            <p className="text-muted-foreground text-lg">Ferramentas especializadas para cada tipo de usuário</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ControlPanel userType="creator" />
            <ControlPanel userType="advertiser" />
            <ControlPanel userType="admin" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary p-3 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">StatusAds Pro</span>
              </div>
              <p className="text-muted-foreground mb-4">
                A plataforma líder no Brasil para monetização de status do WhatsApp.
              </p>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="w-8 h-8 bg-muted rounded-full"></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-background">Para Criadores</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Como Começar</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Definir Preços</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Central de Ajuda</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Política de Pagamentos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-background">Para Empresas</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Encontrar Criadores</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Anúncios Premium</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Suporte Empresarial</li>
                <li className="hover:text-primary transition-colors cursor-pointer">API & Integrações</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-muted mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 StatusAds Pro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <FloatingCTA 
        show={showFloatingCTA} 
        variant="creator" 
        onClick={() => onNavigate?.('auth')} 
      />
    </div>
  );
};

export default Index;