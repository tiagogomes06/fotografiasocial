import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Euro, Package, School, Truck } from "lucide-react";

export const Overview = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalOrders },
        { count: totalProducts },
        { count: totalSchools },
        { data: revenue }
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('schools').select('*', { count: 'exact', head: true }),
        supabase.from('orders')
          .select('total_amount')
          .eq('payment_status', 'completed')
      ]);

      const totalRevenue = revenue?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0;

      return {
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
        totalSchools: totalSchools || 0,
        totalRevenue
      };
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Receita Total
          </CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalRevenue.toFixed(2)}€</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Encomendas
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalOrders}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Produtos
          </CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalProducts}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Escolas
          </CardTitle>
          <School className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalSchools}</div>
        </CardContent>
      </Card>
    </div>
  );
};