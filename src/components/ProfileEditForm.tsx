import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Camera, Save, User } from "lucide-react";

interface ProfileData {
  display_name: string;
  bio: string;
  niche: string;
  price_range: string;
  avatar_url: string;
  is_verified: boolean;
}

interface ProfileEditFormProps {
  initialData?: Partial<ProfileData>;
  onSave?: (data: ProfileData) => void;
}

export const ProfileEditForm = ({ initialData, onSave }: ProfileEditFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    display_name: initialData?.display_name || "",
    bio: initialData?.bio || "",
    niche: initialData?.niche || "",
    price_range: initialData?.price_range || "",
    avatar_url: initialData?.avatar_url || "",
    is_verified: initialData?.is_verified || false,
  });

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
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      onSave?.(formData);
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao atualizar seu perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Perfil Público</Label>
              <p className="text-sm text-muted-foreground">
                Permita que anunciantes encontrem seu perfil
              </p>
            </div>
            <Switch
              checked={formData.is_verified}
              onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
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
