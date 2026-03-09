import AdminLayout from "./AdminLayout";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/format";
import { format } from "date-fns";

export default function AdminOrders() {
  const { data: orders = [] } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, status });
  };

  const statuses = ['pending', 'preparing', 'delivering', 'delivered'];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display font-black mb-8 text-foreground">Order Management</h1>

        <div className="bg-card border-2 border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b-2 border-border text-sm text-muted-foreground uppercase tracking-wider">
                  <th className="p-4 font-bold">Order ID</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Items</th>
                  <th className="p-4 font-bold">Total</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y border-border">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-black text-lg">#{order.id.toString().padStart(4, '0')}</td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {format(new Date(order.createdAt!), 'MMM d, h:mm a')}
                    </td>
                    <td className="p-4 max-w-[200px]">
                      <div className="text-sm truncate">
                        {(order.items as any[]).map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </td>
                    <td className="p-4 font-bold font-display text-accent">{formatPrice(order.totalPrice)}</td>
                    <td className="p-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updateStatus.isPending}
                        className={`font-bold text-sm rounded-xl px-3 py-2 border-2 outline-none cursor-pointer appearance-none
                          ${order.status === 'pending' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                            order.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' : 
                            'bg-blue-100 text-blue-700 border-blue-200'}`}
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s.toUpperCase()}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
