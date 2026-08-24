import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import api from "../services/api";
import EmptyState from "../components/EmptyState";
import { PackageOpen } from "lucide-react";

const statusStyles = {
  Pendiente: "bg-amber-50 text-amber-600",
  Procesando: "bg-blue-50 text-blue-600",
  Enviado: "bg-violet-50 text-violet-600",
  Entregado: "bg-emerald-50 text-emerald-600",
};

function Profile() {
  const { userInfo } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/myorders");

        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Tarjeta de usuario */}
      <div className="card animate-fade-in-up flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-800 text-3xl font-bold text-white">
          {userInfo?.name?.charAt(0).toUpperCase()}
        </span>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">
            {userInfo?.name}
          </h1>

          <p className="mt-1 text-brand-400">{userInfo?.email}</p>

          <span className="mt-3 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold capitalize text-brand-600">
            {userInfo?.role}
          </span>
        </div>
      </div>

      {/* Historial de órdenes */}
      <div className="animate-fade-in-up anim-delay-100 mt-10">
        <h2 className="text-xl font-bold text-brand-900">Mis órdenes</h2>

        {loading ? (
          <div className="mt-5 space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="card h-32 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={PackageOpen}
              title="No tienes órdenes todavía"
              description="Cuando realices tu primera compra aparecerá aquí."
            />
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {orders.map((order) => (
              <article key={order._id} className="card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-brand-900">
                      Orden #{order._id.slice(-6).toUpperCase()}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[order.status] ?? "bg-brand-50 text-brand-500"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="text-sm text-brand-400">
                    {new Date(order.createdAt).toLocaleDateString("es", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-brand-100 pt-4 text-sm text-brand-500">
                  {order.orderItems.map((item, index) => (
                    <li key={index}>
                      {item.qty}× {item.title}
                    </li>
                  ))}
                </ul>

                <p className="mt-4 font-bold text-accent-500">
                  Total: ${Number(order.totalPrice).toFixed(2)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
