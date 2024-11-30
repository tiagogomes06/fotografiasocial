import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolsManagement } from "@/components/admin/SchoolsManagement";
import { ProductsManagement } from "@/components/admin/ProductsManagement";
import { ShippingMethodsManagement } from "@/components/admin/ShippingMethodsManagement";
import { OrdersManagement } from "@/components/admin/OrdersManagement";
import { Overview } from "@/components/admin/Overview";

const Admin = () => {
  return (
    <AdminLayout>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="orders">Encomendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="shipping">Métodos de Envio</TabsTrigger>
          <TabsTrigger value="schools">Escolas</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Overview />
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <OrdersManagement />
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <ProductsManagement />
        </TabsContent>
        <TabsContent value="shipping" className="space-y-4">
          <ShippingMethodsManagement />
        </TabsContent>
        <TabsContent value="schools" className="space-y-4">
          <SchoolsManagement />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Admin;