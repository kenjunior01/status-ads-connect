import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, KeyRound, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResetPasswordProps {
  onNavigate: (page: string) => void;
}

const ResetPassword = ({ onNavigate }: ResetPasswordProps) => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordChecks = [
    { label: "Mín. 6 caracteres", valid: password.length >= 6 },
    { label: "1 letra maiúscula", valid: /[A-Z]/.test(password) },
    { label: "1 número", valid: /[0-9]/.test(password) },
    { label: "Senhas coincidem", valid: password.length > 0 && password === confirmPassword },
  ];

  const allValid = passwordChecks.every(c => c.valid);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } else {
        setSuccess(true);
        toast({ title: "Senha atualizada!", description: "Você já pode fazer login com a nova senha." });
        setTimeout(() => onNavigate('auth'), 2000);
      }
    } catch {
      toast({ title: "Erro inesperado", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/15 via-background to-primary/5">
        <Card className="w-full max-w-[420px] shadow-2xl border-border/30 bg-card/95 backdrop-blur-md rounded-2xl">
          <CardContent className="text-center py-10">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Senha atualizada!</h3>
            <p className="text-sm text-muted-foreground">Redirecionando para o login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/15 via-background to-primary/5">
      <Card className="w-full max-w-[420px] shadow-2xl border-border/30 bg-card/95 backdrop-blur-md rounded-2xl">
        <CardHeader className="text-center pb-2 pt-6">
          <div className="mx-auto mb-3 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
            <KeyRound className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">Nova senha</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Crie uma nova senha para sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground/80 text-xs font-medium uppercase tracking-wider">Nova senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha forte"
                  className="h-11 pr-12 bg-muted/30 border-border/40 focus:border-primary/60"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/80 text-xs font-medium uppercase tracking-wider">Confirmar senha</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="h-11 bg-muted/30 border-border/40 focus:border-primary/60"
              />
            </div>

            {password.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {passwordChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors",
                      check.valid ? "bg-primary" : "bg-muted-foreground/20"
                    )}>
                      {check.valid && <Check className="h-2 w-2 text-primary-foreground" />}
                    </div>
                    <span className={cn("text-[10px]", check.valid ? "text-primary" : "text-muted-foreground")}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" disabled={!allValid || loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl">
              {loading ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
