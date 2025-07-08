import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, 
  Building2, 
  Truck, 
  MapPin, 
  Clock, 
  Shield, 
  Users, 
  BarChart3,
  CheckCircle,
  Star,
  Zap,
  Globe,
  Headphones
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import heroImage from "@/assets/hero-logistics.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Verificar se usuário já está logado
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          navigate("/dashboard");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const features = [
    {
      icon: <Truck className="h-8 w-8 text-primary" />,
      title: "Logística Inteligente",
      description: "Sistema avançado de roteamento e otimização de entregas para máxima eficiência."
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: "Rastreamento em Tempo Real",
      description: "Acompanhe suas entregas em tempo real com precisão e transparência total."
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Entregas Expressas",
      description: "Prazos de entrega otimizados para atender às necessidades do seu negócio."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Segurança Total",
      description: "Seus produtos protegidos com seguro e monitoramento 24/7."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Equipe Especializada",
      description: "Entregadores qualificados e sistema de avaliação contínua."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Relatórios Completos",
      description: "Dashboards e relatórios detalhados para acompanhar o desempenho."
    }
  ];

  const benefits = [
    "Redução de até 40% nos custos de entrega",
    "Aumento de 95% na satisfação do cliente",
    "Integração simples com seu sistema atual",
    "Suporte técnico especializado 24/7",
    "Escalabilidade para crescer com seu negócio"
  ];

  const stats = [
    { number: "10k+", label: "Entregas Realizadas" },
    { number: "500+", label: "Empresas Atendidas" },
    { number: "99.5%", label: "Taxa de Sucesso" },
    { number: "24/7", label: "Suporte Ativo" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-primary shadow-custom-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary-foreground" />
              <span className="text-xl font-bold text-primary-foreground">
                LogiPortal
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Entrar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Cadastrar Empresa
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Logística que 
                  <span className="text-secondary"> Transforma </span>
                  seu Negócio
                </h1>
                <p className="text-xl lg:text-2xl text-primary-foreground/90 leading-relaxed">
                  Plataforma completa de gestão logística para empresas que buscam 
                  excelência em entregas e satisfação total do cliente.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={() => navigate("/auth")}
                  className="shadow-custom-glow"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Ver Demonstração
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-secondary">
                      {stat.number}
                    </div>
                    <div className="text-sm text-primary-foreground/80">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
              Recursos que Fazem a Diferença
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nossa plataforma oferece tudo que sua empresa precisa para otimizar 
              a logística e superar expectativas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-custom-md hover:shadow-custom-lg transition-smooth border-0 bg-card/50 backdrop-blur">
                <CardHeader className="pb-4">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Por que Escolher Nossa Plataforma?
                </h2>
                <p className="text-xl text-primary-foreground/90">
                  Resultados comprovados que transformam a logística 
                  da sua empresa em vantagem competitiva.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/auth")}
                className="shadow-custom-md"
              >
                Solicitar Demonstração
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-primary-light/20 p-6 rounded-lg backdrop-blur">
                  <Zap className="h-8 w-8 text-secondary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Implementação Rápida</h3>
                  <p className="text-primary-foreground/80">
                    Integração completa em até 48 horas
                  </p>
                </div>
                <div className="bg-primary-light/20 p-6 rounded-lg backdrop-blur">
                  <Headphones className="h-8 w-8 text-secondary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Suporte Premium</h3>
                  <p className="text-primary-foreground/80">
                    Atendimento especializado 24/7
                  </p>
                </div>
              </div>
              <div className="space-y-6 pt-12">
                <div className="bg-primary-light/20 p-6 rounded-lg backdrop-blur">
                  <Globe className="h-8 w-8 text-secondary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Cobertura Nacional</h3>
                  <p className="text-primary-foreground/80">
                    Entregas em todo território nacional
                  </p>
                </div>
                <div className="bg-primary-light/20 p-6 rounded-lg backdrop-blur">
                  <Star className="h-8 w-8 text-secondary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Qualidade Garantida</h3>
                  <p className="text-primary-foreground/80">
                    Certificação ISO e padrões internacionais
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary">
              Pronto para Revolucionar sua Logística?
            </h2>
            <p className="text-xl text-muted-foreground">
              Junte-se a centenas de empresas que já transformaram 
              seus resultados com nossa plataforma.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="cta"
                size="xl"
                onClick={() => navigate("/auth")}
                className="shadow-custom-lg"
              >
                <Building2 className="mr-2 h-5 w-5" />
                Cadastrar Minha Empresa
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => navigate("/auth")}
              >
                Já tenho conta
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8" />
                <span className="text-xl font-bold">LogiPortal</span>
              </div>
              <p className="text-primary-foreground/80">
                Transformando a logística empresarial com tecnologia 
                e excelência em atendimento.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Recursos</li>
                <li>Integrações</li>
                <li>API</li>
                <li>Segurança</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Contato</li>
                <li>Status do Sistema</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Sobre Nós</li>
                <li>Carreiras</li>
                <li>Blog</li>
                <li>Imprensa</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/80">
            <p>&copy; 2024 LogiPortal. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
