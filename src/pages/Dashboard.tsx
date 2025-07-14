import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, LogOut, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { OrdersList } from "@/components/orders/OrdersList";
import { OrderForm } from "@/components/orders/OrderForm";
interface EmpresaData {
  id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  cidade: string;
  estado: string;
}
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null);
  const fetchEmpresaData = useCallback(async (authUserId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('empresas').select(`
          id,
          nome_fantasia,
          razao_social,
          cnpj,
          cidade,
          estado
        `).eq('usuario_id', (await supabase.from('usuarios').select('id').eq('auth_user_id', authUserId).single()).data?.id).single();
      if (error) {
        console.error('Erro ao buscar dados da empresa:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os dados da empresa."
        });
        return;
      }
      setEmpresa(data);
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    // Verificar sessão existente
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      // Buscar dados da empresa
      fetchEmpresaData(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, [navigate, fetchEmpresaData]);
  const handleLogout = async () => {
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao fazer logout."
        });
        return;
      }
      navigate("/");
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-primary shadow-custom-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary-foreground" />
              <div>
                <h1 className="text-xl font-bold text-primary-foreground">
                  {empresa?.nome_fantasia || "Portal Empresarial"}
                </h1>
                <p className="text-primary-foreground/80 text-sm">
                  {empresa?.cidade && empresa?.estado && `${empresa.cidade}, ${empresa.estado}`}
                </p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-primary-foreground/20 text-primary-foreground bg-sky-800 hover:bg-sky-700">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Bem-vindo ao seu painel
          </h2>
          <p className="text-muted-foreground">
            Gerencie suas entregas e pedidos de forma eficiente
          </p>
        </div>

        <div className="space-y-8">
          {/* Cards de Estatísticas */}
          <DashboardCards />

          {/* Seção Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <OrderForm />

            <Card className="shadow-custom-md">
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
                <CardDescription>
                  Informações do seu cadastro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {empresa && <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nome Fantasia</p>
                      <p className="text-base">{empresa.nome_fantasia}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Razão Social</p>
                      <p className="text-base">{empresa.razao_social}</p>
                    </div>
                    {empresa.cnpj && <div>
                        <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                        <p className="text-base">{empresa.cnpj}</p>
                      </div>}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Localização</p>
                      <p className="text-base">{empresa.cidade}, {empresa.estado}</p>
                    </div>
                  </div>}
                <Button variant="outline" className="w-full" disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  Editar Dados (Em Breve)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Pedidos */}
          <OrdersList />
        </div>
      </main>
    </div>;
};
export default Dashboard;