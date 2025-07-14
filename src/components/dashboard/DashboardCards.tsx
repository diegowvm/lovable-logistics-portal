import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Users, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  pedidosAtivos: number;
  entregasHoje: number;
  totalPedidos: number;
  statusSistema: 'ativo' | 'inativo';
}

export const DashboardCards = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    pedidosAtivos: 0,
    entregasHoje: 0,
    totalPedidos: 0,
    statusSistema: 'ativo'
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar pedidos ativos (não entregues e não cancelados)
      const { data: pedidosAtivos, error: errorAtivos } = await supabase
        .from('pedidos')
        .select('id')
        .in('status', ['recebido', 'enviado', 'a_caminho']);

      if (errorAtivos) throw errorAtivos;

      // Buscar entregas de hoje (pedidos entregues hoje)
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      const { data: entregasHoje, error: errorEntregas } = await supabase
        .from('pedidos')
        .select('id')
        .eq('status', 'entregue')
        .gte('data_finalizacao', hoje.toISOString())
        .lt('data_finalizacao', amanha.toISOString());

      if (errorEntregas) throw errorEntregas;

      // Buscar total de pedidos da empresa
      const { data: totalPedidos, error: errorTotal } = await supabase
        .from('pedidos')
        .select('id');

      if (errorTotal) throw errorTotal;

      setStats({
        pedidosAtivos: pedidosAtivos?.length || 0,
        entregasHoje: entregasHoje?.length || 0,
        totalPedidos: totalPedidos?.length || 0,
        statusSistema: 'ativo'
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as estatísticas do dashboard."
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = [
    {
      title: "Pedidos Ativos",
      value: loading ? "..." : stats.pedidosAtivos.toString(),
      description: stats.pedidosAtivos === 0 ? "Nenhum pedido ativo no momento" : `${stats.pedidosAtivos} pedido${stats.pedidosAtivos !== 1 ? 's' : ''} em andamento`,
      icon: Package
    },
    {
      title: "Entregas Hoje",
      value: loading ? "..." : stats.entregasHoje.toString(),
      description: stats.entregasHoje === 0 ? "Nenhuma entrega finalizada hoje" : `${stats.entregasHoje} entrega${stats.entregasHoje !== 1 ? 's' : ''} concluída${stats.entregasHoje !== 1 ? 's' : ''} hoje`,
      icon: Truck
    },
    {
      title: "Total de Pedidos",
      value: loading ? "..." : stats.totalPedidos.toString(),
      description: stats.totalPedidos === 0 ? "Nenhum pedido criado ainda" : `Total de pedidos já criados`,
      icon: Users
    },
    {
      title: "Status",
      value: stats.statusSistema === 'ativo' ? "Ativo" : "Inativo",
      description: "Sistema operacional",
      icon: Settings,
      valueClassName: stats.statusSistema === 'ativo' ? "text-green-600" : "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="shadow-custom-sm hover:shadow-custom-md transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.valueClassName || ""}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};