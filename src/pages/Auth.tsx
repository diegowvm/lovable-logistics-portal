import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, Mail, Lock, Phone, MapPin, FileText, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Estados para formulário de login
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Estados para formulário de cadastro
  const [registerData, setRegisterData] = useState({
    // Dados do usuário
    email: "",
    password: "",
    confirmPassword: "",
    nomeContato: "",
    telefone: "",
    
    // Dados da empresa
    nomeFantasia: "",
    razaoSocial: "",
    cnpj: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    emailContato: ""
  });

  // Configurar autenticação
  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirecionar usuários autenticados
        if (session?.user) {
          navigate("/dashboard");
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: error.message === "Invalid login credentials" 
            ? "Credenciais inválidas. Verifique seu email e senha."
            : error.message
        });
        return;
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o painel..."
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: "As senhas não coincidem."
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: "A senha deve ter pelo menos 6 caracteres."
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Criar usuário no Supabase Auth
      const redirectUrl = `${window.location.origin}/`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: registerData.nomeContato,
            telefone: registerData.telefone
          }
        }
      });

      if (authError) {
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: authError.message === "User already registered"
            ? "Este email já está cadastrado. Faça login ou use outro email."
            : authError.message
        });
        return;
      }

      if (!authData.user) {
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: "Não foi possível criar o usuário."
        });
        return;
      }

      // 2. Aguardar a criação automática do usuário na tabela usuarios (via trigger)
      // Aguardar um pouco para o trigger ser executado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Buscar o ID do usuário criado
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (userError || !userData) {
        console.error('Erro ao buscar usuário:', userError);
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: "Usuário criado, mas houve um problema ao configurar o perfil."
        });
        return;
      }

      // 4. Criar registro na tabela empresas
      const { error: empresaError } = await supabase
        .from('empresas')
        .insert({
          usuario_id: userData.id,
          nome_fantasia: registerData.nomeFantasia,
          razao_social: registerData.razaoSocial,
          cnpj: registerData.cnpj || null,
          endereco: registerData.endereco,
          bairro: registerData.bairro || null,
          cidade: registerData.cidade,
          estado: registerData.estado,
          cep: registerData.cep || null,
          telefone: registerData.telefone || null,
          email_contato: registerData.emailContato || registerData.email,
          contato_responsavel: registerData.nomeContato
        });

      if (empresaError) {
        console.error('Erro ao criar empresa:', empresaError);
        toast({
          variant: "destructive",
          title: "Erro no cadastro da empresa",
          description: "Usuário criado, mas houve um problema ao cadastrar a empresa. Entre em contato com o suporte."
        });
        return;
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar a conta e depois faça login."
      });

      // Limpar formulário
      setRegisterData({
        email: "",
        password: "",
        confirmPassword: "",
        nomeContato: "",
        telefone: "",
        nomeFantasia: "",
        razaoSocial: "",
        cnpj: "",
        endereco: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        emailContato: ""
      });

    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o cadastro. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginData.email) {
      toast({
        variant: "destructive",
        title: "Email necessário",
        description: "Digite seu email no campo acima para recuperar a senha."
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginData.email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro na recuperação",
          description: error.message
        });
        return;
      }

      toast({
        title: "Email enviado!",
        description: "Verifique seu email para redefinir a senha."
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao enviar o email de recuperação."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao início
          </Button>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Portal de Empresas
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas entregas com nossa plataforma logística
          </p>
        </div>

        <Card className="shadow-custom-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Acesso Empresarial
            </CardTitle>
            <CardDescription>
              Faça login em sua conta ou cadastre sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastrar Empresa</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Sua senha"
                        className="pl-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    variant="professional"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>

                  <Separator />

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    Esqueceu sua senha?
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-6">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Dados de Acesso</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nome-contato">Nome do Contato *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="nome-contato"
                            type="text"
                            placeholder="Nome completo"
                            className="pl-10"
                            value={registerData.nomeContato}
                            onChange={(e) => setRegisterData({ ...registerData, nomeContato: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Senha *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            className="pl-10"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Senha *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirme sua senha"
                            className="pl-10"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="telefone"
                            type="tel"
                            placeholder="(11) 99999-9999"
                            className="pl-10"
                            value={registerData.telefone}
                            onChange={(e) => setRegisterData({ ...registerData, telefone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Dados da Empresa</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome-fantasia">Nome Fantasia *</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="nome-fantasia"
                            type="text"
                            placeholder="Nome da empresa"
                            className="pl-10"
                            value={registerData.nomeFantasia}
                            onChange={(e) => setRegisterData({ ...registerData, nomeFantasia: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="razao-social">Razão Social *</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="razao-social"
                            type="text"
                            placeholder="Razão social da empresa"
                            className="pl-10"
                            value={registerData.razaoSocial}
                            onChange={(e) => setRegisterData({ ...registerData, razaoSocial: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          type="text"
                          placeholder="00.000.000/0000-00"
                          value={registerData.cnpj}
                          onChange={(e) => setRegisterData({ ...registerData, cnpj: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email-contato">Email de Contato</Label>
                        <Input
                          id="email-contato"
                          type="email"
                          placeholder="contato@empresa.com"
                          value={registerData.emailContato}
                          onChange={(e) => setRegisterData({ ...registerData, emailContato: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="endereco">Endereço *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="endereco"
                            type="text"
                            placeholder="Rua, número, complemento"
                            className="pl-10"
                            value={registerData.endereco}
                            onChange={(e) => setRegisterData({ ...registerData, endereco: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          type="text"
                          placeholder="Bairro"
                          value={registerData.bairro}
                          onChange={(e) => setRegisterData({ ...registerData, bairro: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade *</Label>
                        <Input
                          id="cidade"
                          type="text"
                          placeholder="Cidade"
                          value={registerData.cidade}
                          onChange={(e) => setRegisterData({ ...registerData, cidade: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado *</Label>
                        <Input
                          id="estado"
                          type="text"
                          placeholder="SP"
                          maxLength={2}
                          value={registerData.estado}
                          onChange={(e) => setRegisterData({ ...registerData, estado: e.target.value.toUpperCase() })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          type="text"
                          placeholder="00000-000"
                          value={registerData.cep}
                          onChange={(e) => setRegisterData({ ...registerData, cep: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    variant="cta"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Cadastrando..." : "Cadastrar Empresa"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;