import { useEffect, useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import EmptyState from "../../components/EmptyState";

const STATUSES = ["Pendiente", "Procesando", "Enviado", "Entregado"];

const statusStyles = {
  Pendiente: "bg-amber-50 text-amber-600 border-amber-200",
  Procesando: "bg-blue-50 text-blue-600 border-blue-200",
  Enviado: "bg-violet-50 text-violet-600 border-violet-200",
  Entregado: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await api.get("/orders");

        setOrders(data);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar las órdenes");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleStatusChange = async (order, newStatus) => {
    if (newStatus === order.status) return;

    setUpdatingId(order._id);

    try {
      const { data } = await api.put(`/orders/${order._id}`, {
        status: newStatus,
      });

      setOrders((prev) =>
        prev.map((item) => (item._id === order._id ? data : item))
      );

      toast.success(`Orden #${order._id.slice(-6).toUpperCase()} → ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el estado");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-900">
          Órdenes{" "}
          <span className="ml-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-600">
            {orders.length}
          </span>
        </h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="card h-28 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No hay órdenes"
          description="Cuando los clientes realicen compras, sus órdenes aparecerán aquí."
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order._id} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Info orden */}
                <div className="min-w-0">
                  <p className="font-bold text-brand-900">
                    #{order._id.slice(-6).toUpperCase()}
                  </p>

                  <p className="mt-1 truncate text-sm text-brand-500">
                    {order.user?.name ?? "Cliente eliminado"}
                    {order.user?.email && (
                      <span className="text-brand-300"> · {order.user.email}</span>
                    )}
                  </p>

                  <p className="mt-1 text-xs text-brand-400">
                    {new Date(order.createdAt).toLocaleString("es", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  <ul className="mt-3 flex max-w-md flex-wrap gap-x-4 gap-y-1 text-xs text-brand-400">
                    {order.orderItems.map((item, index) => (
                      <li key={index}>
                        {item.qty}× {item.title}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Total + estado */}
                <div className="flex flex-col items-end gap-3">
                  <span className="text-lg font-bold text-accent-500">
                    ${Number(order.totalPrice).toFixed(2)}
                  </span>

                  <div className="relative flex items-center gap-2">
                    {updatingId === order._id && (
                      <Loader2 size={16} className="animate-spin text-brand-400" />
                    )}

                    <select
                      value={order.status}
                      onChange={(event) =>
                        handleStatusChange(order, event.target.value)
                      }
                      disabled={updatingId === order._id}
                      aria-label={`Estado de la orden ${order._id.slice(-6)}`}
                      className={`cursor-pointer appearance-none rounded-full border px-4 py-1.5 pr-8 text-xs font-semibold transition-colors focus:outline-none disabled:opacity-60 ${
                        statusStyles[order.status] ??
                        "border-brand-200 bg-brand-50 text-brand-500"
                      }`}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status} className="bg-white text-brand-800">
                          {status}
                        </option>
                      ))}
                    </select>

                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 text-[10px]"
                    >
                      ▼
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminOrders;
