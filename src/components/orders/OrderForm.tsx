import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Package, MapPin, Phone, User, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderFormData {
  // Dados da coleta
  endereco_coleta: string;
  bairro_coleta: string;
  cidade_coleta: string;
  cep_coleta: string;
  contato_coleta: string;
  telefone_coleta: string;
  
  // Dados da entrega
  endereco_entrega: string;
  bairro_entrega: string;
  cidade_entrega: string;
  cep_entrega: string;
  contato_entrega: string;
  telefone_entrega: string;
  
  // Dados do produto
  descricao_produto: string;
  valor_produto: number;
  observacoes: string;
}

export const OrderForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [valorFrete, setValorFrete] = useState<number>(0);
  const [formData, setFormData] = useState<OrderFormData>({
    endereco_coleta: "",
    bairro_coleta: "",
    cidade_coleta: "",
    cep_coleta: "",
    contato_coleta: "",
    telefone_coleta: "",
    endereco_entrega: "",
    bairro_entrega: "",
    cidade_entrega: "",
    cep_entrega: "",
    contato_entrega: "",
    telefone_entrega: "",
    descricao_produto: "",
    valor_produto: 0,
    observacoes: ""
  });

  const handleInputChange = (field: keyof OrderFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calcularFrete = async () => {
    // Simulação de cálculo de frete
    // Em um sistema real, isso seria uma API externa ou cálculo mais complexo
    try {
      setLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Cálculo básico baseado na distância simulada
      const freteBase = 15.00;
      const adicionalDistancia = Math.random() * 20; // Simular variação de distância
      const freteCalculado = freteBase + adicionalDistancia;
      
      setValorFrete(Number(freteCalculado.toFixed(2)));
      
      toast({
        title: "Frete Calculado",
        description: `Valor do frete: R$ ${freteCalculado.toFixed(2).replace('.', ',')}`
      });
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível calcular o frete."
      });
    } finally {
      setLoading(false);
    }
  };

  const criarPedido = async () => {
    try {
      setLoading(true);

      // Validações básicas
      if (!formData.endereco_coleta || !formData.cidade_coleta || 
          !formData.endereco_entrega || !formData.cidade_entrega) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Preencha pelo menos os endereços e cidades de coleta e entrega."
        });
        return;
      }

      if (valorFrete === 0) {
        toast({
          variant: "destructive",
          title: "Calcule o Frete",
          description: "É necessário calcular o frete antes de criar o pedido."
        });
        return;
      }

      // Criar o pedido na tabela pedidos
      const { data, error } = await supabase
        .rpc('get_current_user_empresa_id')
        .then(async (empresaIdResult) => {
          if (empresaIdResult.error) throw empresaIdResult.error;
          
          return await supabase
            .from('pedidos')
            .insert({
              empresa_id: empresaIdResult.data,
              endereco_coleta: formData.endereco_coleta,
              bairro_coleta: formData.bairro_coleta || null,
              cidade_coleta: formData.cidade_coleta,
              cep_coleta: formData.cep_coleta || null,
              contato_coleta: formData.contato_coleta || null,
              telefone_coleta: formData.telefone_coleta || null,
              
              endereco_entrega: formData.endereco_entrega,
              bairro_entrega: formData.bairro_entrega || null,
              cidade_entrega: formData.cidade_entrega,
              cep_entrega: formData.cep_entrega || null,
              contato_entrega: formData.contato_entrega || null,
              telefone_entrega: formData.telefone_entrega || null,
              
              descricao_produto: formData.descricao_produto || null,
              valor_produto: formData.valor_produto || null,
              valor_frete: valorFrete,
              valor_total: (formData.valor_produto || 0) + valorFrete,
              observacoes: formData.observacoes || null,
              
              status: 'recebido'
            })
            .select();
        });

      if (error) throw error;

      toast({
        title: "Pedido Criado!",
        description: `Pedido ${data[0]?.numero_pedido} criado com sucesso.`
      });

      // Limpar formulário
      setFormData({
        endereco_coleta: "",
        bairro_coleta: "",
        cidade_coleta: "",
        cep_coleta: "",
        contato_coleta: "",
        telefone_coleta: "",
        endereco_entrega: "",
        bairro_entrega: "",
        cidade_entrega: "",
        cep_entrega: "",
        contato_entrega: "",
        telefone_entrega: "",
        descricao_produto: "",
        valor_produto: 0,
        observacoes: ""
      });
      setValorFrete(0);

    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o pedido."
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="shadow-custom-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Criar Novo Pedido
        </CardTitle>
        <CardDescription>
          Preencha os dados para solicitar uma entrega
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Dados da Coleta */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Dados da Coleta</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endereco_coleta">Endereço *</Label>
              <Input
                id="endereco_coleta"
                value={formData.endereco_coleta}
                onChange={(e) => handleInputChange('endereco_coleta', e.target.value)}
                placeholder="Rua, número, complemento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bairro_coleta">Bairro</Label>
              <Input
                id="bairro_coleta"
                value={formData.bairro_coleta}
                onChange={(e) => handleInputChange('bairro_coleta', e.target.value)}
                placeholder="Nome do bairro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade_coleta">Cidade *</Label>
              <Input
                id="cidade_coleta"
                value={formData.cidade_coleta}
                onChange={(e) => handleInputChange('cidade_coleta', e.target.value)}
                placeholder="Nome da cidade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep_coleta">CEP</Label>
              <Input
                id="cep_coleta"
                value={formData.cep_coleta}
                onChange={(e) => handleInputChange('cep_coleta', e.target.value)}
                placeholder="00000-000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contato_coleta">Contato</Label>
              <Input
                id="contato_coleta"
                value={formData.contato_coleta}
                onChange={(e) => handleInputChange('contato_coleta', e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone_coleta">Telefone</Label>
              <Input
                id="telefone_coleta"
                value={formData.telefone_coleta}
                onChange={(e) => handleInputChange('telefone_coleta', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Dados da Entrega */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-secondary" />
            <h3 className="text-lg font-semibold">Dados da Entrega</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endereco_entrega">Endereço *</Label>
              <Input
                id="endereco_entrega"
                value={formData.endereco_entrega}
                onChange={(e) => handleInputChange('endereco_entrega', e.target.value)}
                placeholder="Rua, número, complemento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bairro_entrega">Bairro</Label>
              <Input
                id="bairro_entrega"
                value={formData.bairro_entrega}
                onChange={(e) => handleInputChange('bairro_entrega', e.target.value)}
                placeholder="Nome do bairro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade_entrega">Cidade *</Label>
              <Input
                id="cidade_entrega"
                value={formData.cidade_entrega}
                onChange={(e) => handleInputChange('cidade_entrega', e.target.value)}
                placeholder="Nome da cidade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep_entrega">CEP</Label>
              <Input
                id="cep_entrega"
                value={formData.cep_entrega}
                onChange={(e) => handleInputChange('cep_entrega', e.target.value)}
                placeholder="00000-000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contato_entrega">Contato</Label>
              <Input
                id="contato_entrega"
                value={formData.contato_entrega}
                onChange={(e) => handleInputChange('contato_entrega', e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone_entrega">Telefone</Label>
              <Input
                id="telefone_entrega"
                value={formData.telefone_entrega}
                onChange={(e) => handleInputChange('telefone_entrega', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Dados do Produto */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-accent" />
            <h3 className="text-lg font-semibold">Dados do Produto</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descricao_produto">Descrição do Produto</Label>
              <Input
                id="descricao_produto"
                value={formData.descricao_produto}
                onChange={(e) => handleInputChange('descricao_produto', e.target.value)}
                placeholder="Descreva o que será entregue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor_produto">Valor do Produto (R$)</Label>
              <Input
                id="valor_produto"
                type="number"
                step="0.01"
                value={formData.valor_produto}
                onChange={(e) => handleInputChange('valor_produto', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Instruções especiais para a entrega"
              rows={3}
            />
          </div>
        </div>

        <Separator />

        {/* Cálculo do Frete */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Frete</h3>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={calcularFrete}
              disabled={loading || !formData.cidade_coleta || !formData.cidade_entrega}
            >
              <Calculator className="h-4 w-4 mr-2" />
              {loading ? "Calculando..." : "Calcular Frete"}
            </Button>
            
            {valorFrete > 0 && (
              <div className="text-lg font-semibold text-primary">
                Frete: {formatCurrency(valorFrete)}
              </div>
            )}
          </div>

          {valorFrete > 0 && formData.valor_produto > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Valor do Produto:</span>
                  <span>{formatCurrency(formData.valor_produto)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor do Frete:</span>
                  <span>{formatCurrency(valorFrete)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(formData.valor_produto + valorFrete)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botão de Criar Pedido */}
        <div className="pt-4">
          <Button
            onClick={criarPedido}
            disabled={loading || valorFrete === 0}
            className="w-full"
            size="lg"
          >
            {loading ? "Criando Pedido..." : "Criar Pedido"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};