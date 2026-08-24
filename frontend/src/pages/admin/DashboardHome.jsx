import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  DollarSign,
  Layers,
  Package,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../services/api";

const statusStyles = {
  Pendiente: "bg-amber-50 text-amber-600",
  Procesando: "bg-blue-50 text-blue-600",
  Enviado: "bg-violet-50 text-violet-600",
  Entregado: "bg-emerald-50 text-emerald-600",
};

function DashboardHome() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes, statsRes] =
          await Promise.all([
            api.get("/products"),
            api.get("/orders"),
            api.get("/orders/stats"),
          ]);

        setProducts(productsRes.data);
        setOrders(ordersRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalStock = products.reduce((acc, product) => acc + product.stock, 0);

  const totalSales = orders.reduce(
    (acc, order) => acc + Number(order.totalPrice || 0),
    0
  );

  const metrics = [
    {
      label: "Productos",
      value: products.length,
      icon: Package,
      bg: "bg-brand-100 text-brand-700",
    },
    {
      label: "Stock total",
      value: totalStock,
      icon: Layers,
      bg: "bg-sky-50 text-sky-600",
    },
    {
      label: "Órdenes",
      value: orders.length,
      icon: ClipboardList,
      bg: "bg-violet-50 text-violet-600",
    },
    {
      label: "Ventas",
      value: `$${totalSales.toFixed(2)}`,
      icon: DollarSign,
      bg: "bg-emerald-50 text-emerald-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      {/* Métricas */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, bg }) => (
          <div key={label} className="card p-6">
            <div className="flex items-center justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={21} strokeWidth={1.8} />
              </span>
            </div>

            <p className="mt-4 text-3xl font-extrabold tracking-tight text-brand-900">
              {value}
            </p>

            <p className="mt-1 text-sm font-medium text-brand-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Gráfica de ventas */}
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-brand-900">
              <TrendingUp size={18} className="text-emerald-500" />
              Ventas de los últimos 30 días
            </h2>

            <p className="mt-1 text-sm text-brand-400">
              {stats?.totals.count ?? 0}{" "}
              {(stats?.totals.count ?? 0) === 1
                ? "orden"
                : "órdenes"}{" "}
              por un total de{" "}
              <span className="font-semibold text-accent-500">
                ${(stats?.totals.revenue ?? 0).toFixed(2)}
              </span>
            </p>
          </div>
        </div>

        {stats ? (
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.daily}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="ventasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A373" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#D4A373" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />

                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    value.slice(5).split("-").reverse().join("/")
                  }
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={28}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(value) => `$${value}`}
                />

                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Ventas"]}
                  labelFormatter={(label) =>
                    `Día ${label.slice(5).split("-").reverse().join("/")}`
                  }
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4A373"
                  strokeWidth={2.5}
                  fill="url(#ventasGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-6 h-72 animate-pulse rounded-xl bg-brand-50" />
        )}
      </section>

      {/* Últimas órdenes */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4">
          <h2 className="font-bold text-brand-900">Últimas órdenes</h2>

          <Link
            to="/admin/ordenes"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900"
          >
            Ver todas <ArrowRight size={15} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-brand-400">
            Aún no hay órdenes registradas.
          </p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {orders.slice(0, 5).map((order) => (
              <li key={order._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-brand-900">
                    #{order._id.slice(-6).toUpperCase()}
                  </p>

                  <p className="text-xs text-brand-400">
                    {order.user?.name ?? "Cliente"} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("es")}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[order.status] ?? "bg-brand-50 text-brand-500"
                    }`}
                  >
                    {order.status}
                  </span>

                  <span className="text-sm font-bold text-accent-500">
                    ${Number(order.totalPrice).toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default DashboardHome;
