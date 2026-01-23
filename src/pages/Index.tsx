import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/HeroSearch";
import { PremiumCreatorCard } from "@/components/PremiumCreatorCard";
import { CategoryTabs } from "@/components/CategoryTabs";
import { AdvancedFiltersSidebar, MobileFiltersSheet, FilterState } from "@/components/AdvancedFiltersSidebar";
import { TrustIndicators, SocialProof } from "@/components/TrustIndicators";
import { EnhancedCTA, FloatingCTA } from "@/components/EnhancedCTA";
import { CreatorProfile } from "@/pages/CreatorProfile";
import { useProfiles } from "@/hooks/useProfiles";
import { useFavorites } from "@/hooks/useFavorites";
import { 
  Users, 
  MessageSquare, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Shield,
  Award,
  Zap,
  ArrowRight,
  ChevronDown,
  Heart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IndexProps {
  onNavigate?: (page: string) => void;
}

const defaultFilters: FilterState = {
  priceRange: [0, 500],
  niches: [],
  minRating: 0,
  minCampaigns: 0,
  minResponseRate: 0,
  onlineOnly: false,
  verifiedOnly: false,
  badgeLevels: []
};

const Index = ({ onNavigate }: IndexProps) => {
  const { toast } = useToast();
  const { profiles, loading, getFeaturedProfiles, getNewProfiles, getDiscoverProfiles } = useProfiles();
  const { favorites, getFavoriteCount } = useFavorites();
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [activeCategory, setActiveCategory] = useState("featured");
  const [showAllProfiles, setShowAllProfiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileSelect = (profile: any) => {
    setSelectedProfile(profile);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    toast({
      title: "Buscando...",
      description: `Procurando criadores para: "${query}"`,
    });
  };

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category.toLowerCase());
    toast({
      title: `Categoria: ${category}`,
      description: "Filtrando criadores por categoria",
    });
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  // Apply filters to profiles
  const applyFilters = (profilesList: any[]) => {
    return profilesList.filter(profile => {
      // Price filter
      const price = parseInt(profile.price_range?.replace(/\D/g, '') || '50');
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Rating filter
      if (filters.minRating > 0 && profile.rating < filters.minRating) {
        return false;
      }

      // Campaigns filter
      if (filters.minCampaigns > 0 && profile.total_campaigns < filters.minCampaigns) {
        return false;
      }

      // Verified filter
      if (filters.verifiedOnly && !profile.is_verified) {
        return false;
      }

      // Badge level filter
      if (filters.badgeLevels.length > 0 && !filters.badgeLevels.includes(profile.badge_level)) {
        return false;
      }

      // Niche filter
      if (filters.niches.length > 0) {
        const nicheMap: Record<string, string[]> = {
          lifestyle: ["Lifestyle", "Viagem"],
          fitness: ["Fitness & Saúde", "Fitness"],
          tech: ["Tecnologia", "Tech"],
          beauty: ["Beleza & Moda", "Beleza"],
          food: ["Culinária", "Gastronomia"],
          travel: ["Viagem", "Travel"],
          gaming: ["Games", "Gaming"],
          education: ["Educação", "Education"],
          business: ["Negócios", "Business"],
          design: ["Arte & Design", "Design"],
        };
        
        const matchesNiche = filters.niches.some(niche => {
          const niches = nicheMap[niche] || [];
          return profile.niche && niches.some(n => 
            profile.niche?.toLowerCase().includes(n.toLowerCase())
          );
        });
        
        if (!matchesNiche) return false;
      }

      return true;
    });
  };

  // Get profiles based on active category
  const getActiveProfiles = () => {
    let baseProfiles: any[];
    
    switch (activeCategory) {
      case "featured":
        baseProfiles = getFeaturedProfiles();
        break;
      case "recent":
        baseProfiles = getNewProfiles();
        break;
      case "trending":
        baseProfiles = [...profiles].sort((a, b) => b.total_campaigns - a.total_campaigns).slice(0, 24);
        break;
      case "favorites":
        baseProfiles = profiles.filter(p => favorites.some(f => f.id === p.id));
        break;
      default:
        // Filter by niche
        const nicheMap: Record<string, string[]> = {
          lifestyle: ["Lifestyle", "Viagem"],
          fitness: ["Fitness & Saúde", "Fitness"],
          tech: ["Tecnologia", "Tech"],
          beauty: ["Beleza & Moda", "Beleza"],
          food: ["Culinária", "Gastronomia"],
          travel: ["Viagem", "Travel"],
          gaming: ["Games", "Gaming"],
          education: ["Educação", "Education"],
          business: ["Negócios", "Business"],
          design: ["Arte & Design", "Design"],
        };
        const niches = nicheMap[activeCategory] || [];
        baseProfiles = profiles.filter(p => 
          p.niche && niches.some(n => p.niche?.toLowerCase().includes(n.toLowerCase()))
        );
    }

    return applyFilters(baseProfiles);
  };

  const activeProfiles = getActiveProfiles();
  const displayProfiles = showAllProfiles ? activeProfiles : activeProfiles.slice(0, 8);

  // Show Creator Profile if selected
  if (selectedProfile) {
    return (
      <CreatorProfile 
        profile={selectedProfile}
        onBack={() => setSelectedProfile(null)}
        onContact={() => {
          toast({
            title: "Iniciando conversa...",
            description: `Abrindo chat com ${selectedProfile.display_name}`,
          });
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">Carregando criadores...</p>
            <p className="text-sm text-muted-foreground">Preparando as melhores oportunidades</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Search */}
      <section className="relative py-16 px-4 bg-gradient-hero overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">A maior plataforma de anúncios no WhatsApp Status</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Encontre o Criador Ideal
            <br />
            <span className="text-white/90">para sua Campanha</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Conecte-se com milhares de criadores verificados e alcance seu público-alvo através do WhatsApp Status.
          </p>
          
          {/* Search Component */}
          <HeroSearch onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="py-6 px-4 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-xl text-foreground">5.2k+</p>
                <p className="text-xs text-muted-foreground">Criadores Ativos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-bold text-xl text-foreground">R$ 2.5M+</p>
                <p className="text-xs text-muted-foreground">Pagos a Criadores</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="font-bold text-xl text-foreground">4.9★</p>
                <p className="text-xs text-muted-foreground">Avaliação Média</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-bold text-xl text-foreground">100%</p>
                <p className="text-xs text-muted-foreground">Pagamento Seguro</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Listings Section with Sidebar */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Explore Criadores
                </h2>
                <p className="text-muted-foreground">
                  {activeProfiles.length} criadores disponíveis
                </p>
              </div>
              
              {/* Mobile Filters */}
              <div className="flex items-center gap-2">
                <MobileFiltersSheet
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={clearFilters}
                >
                  <span />
                </MobileFiltersSheet>
                
                {/* Favorites Button */}
                <Button
                  variant={activeCategory === "favorites" ? "default" : "outline"}
                  onClick={() => setActiveCategory("favorites")}
                  className="gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Favoritos ({getFavoriteCount()})
                </Button>
              </div>
            </div>

            {/* Category Tabs */}
            <CategoryTabs 
              activeTab={activeCategory} 
              onTabChange={(tab) => {
                setActiveCategory(tab);
                setShowAllProfiles(false);
              }}
              counts={{
                featured: getFeaturedProfiles().length,
                recent: getNewProfiles().length,
                trending: profiles.length,
              }}
            />
          </div>

          {/* Content Grid with Sidebar */}
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <AdvancedFiltersSidebar
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
            />

            {/* Profile Grid */}
            <div className="flex-1">
              {displayProfiles.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {displayProfiles.map((profile, index) => (
                      <PremiumCreatorCard 
                        key={profile.id} 
                        profile={profile} 
                        onSelect={handleProfileSelect}
                        variant={index < 2 && activeCategory === "featured" ? "featured" : "default"}
                        showFavoriteButton
                      />
                    ))}
                  </div>

                  {/* Load More */}
                  {activeProfiles.length > 8 && !showAllProfiles && (
                    <div className="text-center mt-10">
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => setShowAllProfiles(true)}
                        className="gap-2 px-8"
                      >
                        <ChevronDown className="h-4 w-4" />
                        Ver Mais ({activeProfiles.length - 8} criadores)
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    {activeCategory === "favorites" ? (
                      <Heart className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <Users className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {activeCategory === "favorites" 
                      ? "Nenhum favorito ainda"
                      : "Nenhum criador encontrado"
                    }
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {activeCategory === "favorites"
                      ? "Adicione criadores aos seus favoritos clicando no ❤️"
                      : "Tente ajustar os filtros ou explorar outras categorias"
                    }
                  </p>
                  <Button variant="outline" onClick={() => {
                    setActiveCategory("featured");
                    clearFilters();
                  }}>
                    Ver Criadores em Destaque
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <SocialProof />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Award className="h-4 w-4" />
            <span className="text-sm">Junte-se a mais de 5.000 criadores</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comece a Monetizar Hoje
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Transforme seus stories do WhatsApp em uma fonte de renda recorrente. É rápido, fácil e seguro.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 gap-2 px-8"
              onClick={() => onNavigate?.('auth')}
            >
              Criar Conta Grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => onNavigate?.('auth')}
            >
              Sou Anunciante
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary p-2.5 rounded-xl">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">StatusAds</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                A plataforma líder em monetização de status do WhatsApp no Brasil.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-background">Plataforma</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Como Funciona</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Preços</li>
                <li className="hover:text-primary transition-colors cursor-pointer">FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-background">Para Criadores</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Cadastre-se</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Central de Ajuda</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Dicas de Sucesso</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-background">Para Empresas</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Anuncie Conosco</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Suporte Empresarial</li>
                <li className="hover:text-primary transition-colors cursor-pointer">API</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-muted mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2024 StatusAds. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="hover:text-primary cursor-pointer">Termos</span>
              <span className="hover:text-primary cursor-pointer">Privacidade</span>
              <span className="hover:text-primary cursor-pointer">Cookies</span>
            </div>
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
