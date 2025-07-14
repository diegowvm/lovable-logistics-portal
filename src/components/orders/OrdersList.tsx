import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Package, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Pedido {
  id: string;
  numero_pedido: string;
  status: string;
  endereco_coleta: string;
  cidade_coleta: string;
  endereco_entrega: string;
  cidade_entrega: string;
  valor_frete: number;
  valor_total: number | null;
  data_criacao: string;
  data_atribuicao: string | null;
  data_finalizacao: string | null;
  entregador_id: string | null;
}

const statusOptions = [
  { value: "all", label: "Todos os Status" },
  { value: "recebido", label: "Recebido" },
  { value: "enviado", label: "Enviado" },
  { value: "a_caminho", label: "A Caminho" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" }
];

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: React.ElementType }> = {
    recebido: { label: "Recebido", variant: "secondary", icon: Package },
    enviado: { label: "Enviado", variant: "default", icon: Truck },
    a_caminho: { label: "A Caminho", variant: "default", icon: MapPin },
    entregue: { label: "Entregue", variant: "secondary", icon: Package },
    cancelado: { label: "Cancelado", variant: "destructive", icon: Package }
  };

  const config = statusMap[status] || statusMap.recebido;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export const OrdersList = () => {
  const { toast } = useToast();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('pedidos')
        .select(`
          id,
          numero_pedido,
          status,
          endereco_coleta,
          cidade_coleta,
          endereco_entrega,
          cidade_entrega,
          valor_frete,
          valor_total,
          data_criacao,
          data_atribuicao,
          data_finalizacao,
          entregador_id
        `)
        .order('data_criacao', { ascending: false });

      // Aplicar filtro de status se não for "all"
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setPedidos(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os pedidos."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [statusFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <Card className="shadow-custom-md">
        <CardHeader>
          <CardTitle>Seus Pedidos</CardTitle>
          <CardDescription>Carregando pedidos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-custom-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Seus Pedidos
            </CardTitle>
            <CardDescription>
              Visualize e acompanhe o status de todas as suas entregas
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={fetchPedidos}
              className="whitespace-nowrap"
            >
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {pedidos.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {statusFilter === "all" 
                ? "Nenhum pedido encontrado. Crie seu primeiro pedido!" 
                : `Nenhum pedido encontrado com status "${statusOptions.find(s => s.value === statusFilter)?.label}"`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Coleta</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {pedido.numero_pedido}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(pedido.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{pedido.endereco_coleta}</div>
                        <div className="text-muted-foreground">{pedido.cidade_coleta}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{pedido.endereco_entrega}</div>
                        <div className="text-muted-foreground">{pedido.cidade_entrega}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {formatCurrency(pedido.valor_frete)}
                        </div>
                        {pedido.valor_total && (
                          <div className="text-muted-foreground">
                            Total: {formatCurrency(pedido.valor_total)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(pedido.data_criacao)}
                        </div>
                        {pedido.data_finalizacao && (
                          <div className="text-muted-foreground text-xs">
                            Finalizado: {formatDate(pedido.data_finalizacao)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};