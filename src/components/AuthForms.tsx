import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Star, Users, ArrowLeft } from "lucide-react";
import { loginSchema, signupSchema, resetPasswordSchema, type LoginFormData, type SignupFormData } from "@/lib/auth-schemas";

interface LoginFormProps {
  onShowPassword: boolean;
  onTogglePassword: () => void;
  loading: boolean;
}

export const LoginForm = ({ onShowPassword, onTogglePassword, loading }: LoginFormProps) => {
  const { toast } = useToast();
  const [loginData, setLoginData] = useState<LoginFormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        toast({
          title: "Erro de login",
          description: error.message.includes('Invalid login credentials')
            ? "Email ou senha incorretos. Tente novamente."
            : error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Login realizado!", description: "Bem-vindo de volta à plataforma." });
      }
    } catch {
      toast({ title: "Erro inesperado", description: "Tente novamente.", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="seu@email.com"
          value={loginData.email}
          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
          className={`h-12 ${errors.email ? 'border-destructive' : ''}`}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={onShowPassword ? "text" : "password"}
            placeholder="Sua senha"
            value={loginData.password}
            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
            className={`h-12 pr-12 ${errors.password ? 'border-destructive' : ''}`}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={onTogglePassword}
          >
            {onShowPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <Button type="submit" className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-semibold" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};

export const SignupForm = ({ onShowPassword, onTogglePassword, loading }: LoginFormProps) => {
  const { toast } = useToast();
  const [signupData, setSignupData] = useState<SignupFormData>({ name: '', role: 'creator', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(signupData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { display_name: signupData.name, role: signupData.role }
        }
      });

      if (error) {
        toast({
          title: error.message.includes('User already registered') ? "Usuário já existe" : "Erro no cadastro",
          description: error.message.includes('User already registered')
            ? "Este email já está registrado. Faça login."
            : error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Cadastro realizado!", description: "Confirme seu email para ativar sua conta." });
        setSignupData({ name: '', role: 'creator', email: '', password: '' });
      }
    } catch {
      toast({ title: "Erro inesperado", description: "Tente novamente.", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Nome Completo</Label>
        <Input
          id="signup-name"
          placeholder="Seu nome completo"
          value={signupData.name}
          onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
          className={`h-12 ${errors.name ? 'border-destructive' : ''}`}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-role">Tipo de Conta</Label>
        <Select value={signupData.role} onValueChange={(value: "creator" | "advertiser") => setSignupData(prev => ({ ...prev, role: value }))}>
          <SelectTrigger className={`h-12 ${errors.role ? 'border-destructive' : ''}`}>
            <SelectValue placeholder="Selecione o tipo de conta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="creator">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-success" />
                <span>Criador - Monetize seus status</span>
              </div>
            </SelectItem>
            <SelectItem value="advertiser">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Anunciante - Encontre criadores</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="seu@email.com"
          value={signupData.email}
          onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
          className={`h-12 ${errors.email ? 'border-destructive' : ''}`}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Senha</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={onShowPassword ? "text" : "password"}
            placeholder="Mín. 6 chars, 1 maiúscula, 1 número"
            value={signupData.password}
            onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
            className={`h-12 pr-12 ${errors.password ? 'border-destructive' : ''}`}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={onTogglePassword}
          >
            {onShowPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <Button type="submit" className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-semibold" disabled={loading}>
        {loading ? "Cadastrando..." : "Criar Conta"}
      </Button>
    </form>
  );
};

interface ResetPasswordFormProps {
  onBack: () => void;
}

export const ResetPasswordForm = ({ onBack }: ResetPasswordFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = resetPasswordSchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } else {
        setSent(true);
        toast({ title: "Email enviado!", description: "Verifique sua caixa de entrada." });
      }
    } catch {
      toast({ title: "Erro inesperado", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <Star className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-lg font-semibold">Email enviado!</h3>
        <p className="text-sm text-muted-foreground">
          Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
        </p>
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar ao login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold">Esqueceu sua senha?</h3>
        <p className="text-sm text-muted-foreground">Digite seu email para receber um link de redefinição.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`h-12 ${errors.email ? 'border-destructive' : ''}`}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>
      <Button type="submit" className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-semibold" disabled={loading}>
        {loading ? "Enviando..." : "Enviar link de redefinição"}
      </Button>
      <Button type="button" variant="ghost" className="w-full gap-2" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" /> Voltar ao login
      </Button>
    </form>
  );
};
