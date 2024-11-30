import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export const OrdersManagement = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const query = supabase
        .from("orders")
        .select(`
          *,
          shipping_methods (*),
          order_items (
            *,
            products (*),
            photos (*)
          ),
          students (
            *,
            classes (
              *,
              schools (*)
            )
          )
        `);

      if (statusFilter !== "all") {
        query.eq("payment_status", statusFilter);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline" } } = {
      pending: { label: "Pendente", variant: "secondary" },
      processing: { label: "Em Processamento", variant: "default" },
      completed: { label: "Completo", variant: "default" },
      failed: { label: "Falhado", variant: "destructive" },
      cancelled: { label: "Cancelado", variant: "outline" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "secondary" };

    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Encomendas</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="processing">Em Processamento</SelectItem>
            <SelectItem value="completed">Completos</SelectItem>
            <SelectItem value="failed">Falhados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono">{order.id.slice(0, 8)}</TableCell>
              <TableCell>
                {new Date(order.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{order.shipping_name}</TableCell>
              <TableCell>{order.total_amount}€</TableCell>
              <TableCell>{getStatusBadge(order.payment_status)}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Detalhes da Encomenda</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold mb-2">
                              Informação do Cliente
                            </h3>
                            <div className="space-y-1">
                              <p>Nome: {selectedOrder.shipping_name}</p>
                              <p>Email: {selectedOrder.email}</p>
                              <p>Telefone: {selectedOrder.shipping_phone}</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">
                              Informação de Envio
                            </h3>
                            <div className="space-y-1">
                              <p>
                                Método:{" "}
                                {selectedOrder.shipping_methods?.name || "N/A"}
                              </p>
                              {selectedOrder.shipping_address && (
                                <>
                                  <p>
                                    Morada: {selectedOrder.shipping_address}
                                  </p>
                                  <p>
                                    Código Postal:{" "}
                                    {selectedOrder.shipping_postal_code}
                                  </p>
                                  <p>Cidade: {selectedOrder.shipping_city}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Itens</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Quantidade</TableHead>
                                <TableHead>Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedOrder.order_items.map((item: any) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.products.name}</TableCell>
                                  <TableCell>{item.price_at_time}€</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>
                                    {(
                                      item.price_at_time * item.quantity
                                    ).toFixed(2)}
                                    €
                                  </TableCell>
                                </TableRow>
                              ))}
                              {selectedOrder.shipping_methods?.price > 0 && (
                                <TableRow>
                                  <TableCell>
                                    Envio ({selectedOrder.shipping_methods?.name})
                                  </TableCell>
                                  <TableCell>
                                    {selectedOrder.shipping_methods?.price}€
                                  </TableCell>
                                  <TableCell>1</TableCell>
                                  <TableCell>
                                    {selectedOrder.shipping_methods?.price}€
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>

                        <div className="flex justify-end">
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-lg font-bold">
                              Total: {selectedOrder.total_amount}€
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};