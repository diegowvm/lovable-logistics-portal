import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, LogOut, Package, Truck, Users, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null);

  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
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
  }, [navigate]);

  const fetchEmpresaData = async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select(`
          id,
          nome_fantasia,
          razao_social,
          cnpj,
          cidade,
          estado
        `)
        .eq('usuario_id', (await supabase
          .from('usuarios')
          .select('id')
          .eq('auth_user_id', authUserId)
          .single()
        ).data?.id)
        .single();

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
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
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
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
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
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
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

        {/* Cards de Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-custom-sm hover:shadow-custom-md transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Ativos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Nenhum pedido ativo no momento
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-custom-sm hover:shadow-custom-md transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregas Hoje</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Nenhuma entrega programada
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-custom-sm hover:shadow-custom-md transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregadores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Disponíveis no momento
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-custom-sm hover:shadow-custom-md transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Ativo</div>
              <p className="text-xs text-muted-foreground">
                Sistema operacional
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seção Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-custom-md">
            <CardHeader>
              <CardTitle>Novos Pedidos</CardTitle>
              <CardDescription>
                Crie e gerencie suas solicitações de entrega
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Em breve você poderá criar pedidos diretamente pelo painel e acompanhar suas entregas em tempo real.
              </p>
              <Button variant="cta" className="w-full" disabled>
                <Package className="mr-2 h-4 w-4" />
                Criar Novo Pedido (Em Breve)
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-custom-md">
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Informações do seu cadastro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {empresa && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome Fantasia</p>
                    <p className="text-base">{empresa.nome_fantasia}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Razão Social</p>
                    <p className="text-base">{empresa.razao_social}</p>
                  </div>
                  {empresa.cnpj && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                      <p className="text-base">{empresa.cnpj}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Localização</p>
                    <p className="text-base">{empresa.cidade}, {empresa.estado}</p>
                  </div>
                </div>
              )}
              <Button variant="outline" className="w-full" disabled>
                <Settings className="mr-2 h-4 w-4" />
                Editar Dados (Em Breve)
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;