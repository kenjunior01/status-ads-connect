import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Shield, Users, Star } from "lucide-react";
import { LoginForm, SignupForm, ResetPasswordForm } from "@/components/AuthForms";
import type { Session, User } from '@supabase/supabase-js';

interface AuthProps {
  onNavigate: (page: string) => void;
}

const Auth = ({ onNavigate }: AuthProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: roleData } = await supabase
                .rpc('get_user_role', { _user_id: session.user.id });
              
              if (roleData === 'admin') onNavigate('admin-dashboard');
              else if (roleData === 'creator') onNavigate('creator-dashboard');
              else if (roleData === 'advertiser') onNavigate('advertiser-dashboard');
              else onNavigate('index');
            } catch {
              onNavigate('index');
            }
          }, 100);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [onNavigate]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Redirecionando...</h2>
          <p>Aguarde enquanto preparamos seu dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              StatusAds Pro
            </CardTitle>
            <CardDescription className="text-base">
              Monetize seus status do WhatsApp
            </CardDescription>
          </CardHeader>

          <CardContent>
            {showResetPassword ? (
              <ResetPasswordForm onBack={() => setShowResetPassword(false)} />
            ) : (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Cadastrar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <LoginForm
                    onShowPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    loading={loading}
                  />
                  <div className="mt-3 text-center">
                    <Button
                      variant="link"
                      className="text-sm text-muted-foreground hover:text-primary"
                      onClick={() => setShowResetPassword(true)}
                    >
                      Esqueceu sua senha?
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="signup">
                  <SignupForm
                    onShowPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    loading={loading}
                  />
                </TabsContent>
              </Tabs>
            )}

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('index')}
                className="text-muted-foreground hover:text-primary"
              >
                ← Voltar ao início
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-white/80">
          <div className="flex justify-center items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>5k+ Usuários</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>4.9★ Avaliação</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
