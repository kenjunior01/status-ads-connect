import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { Camera, Save, User, Loader2 } from "lucide-react";

export const ProfileEditForm = () => {
  const { profile, loading, saving, updateProfile } = useProfile();
  
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    niche: "",
    price_range: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        niche: profile.niche || "",
        price_range: profile.price_range || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const niches = [
    "Beleza",
    "Fitness",
    "Tecnologia",
    "Gastronomia",
    "Viagens",
    "Moda",
    "Lifestyle",
    "Negócios",
    "Educação",
    "Entretenimento",
  ];

  const priceRanges = [
    { value: "budget", label: "Econômico (R$ 10-50)" },
    { value: "mid-range", label: "Intermediário (R$ 50-150)" },
    { value: "premium", label: "Premium (R$ 150-500)" },
    { value: "luxury", label: "Luxo (R$ 500+)" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Foto de Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={formData.avatar_url} />
            <AvatarFallback className="bg-primary/10">
              <User className="h-12 w-12 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="URL da imagem de perfil"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Cole a URL de uma imagem ou faça upload
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="display_name">Nome de Exibição</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="Como você quer ser conhecido"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Conte um pouco sobre você e seu conteúdo..."
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              {formData.bio.length}/500 caracteres
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="niche">Nicho Principal</Label>
            <Select
              value={formData.niche}
              onValueChange={(value) => setFormData({ ...formData, niche: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu nicho" />
              </SelectTrigger>
              <SelectContent>
                {niches.map((niche) => (
                  <SelectItem key={niche} value={niche}>
                    {niche}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price_range">Faixa de Preço</Label>
            <Select
              value={formData.price_range}
              onValueChange={(value) => setFormData({ ...formData, price_range: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua faixa de preço" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </div>
        )}
      </Button>
    </form>
  );
};
