import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CircleDashed,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { CartContext } from "../context/cartContext";

const STATUS_STEPS = ["Pendiente", "Procesando", "Enviado", "Entregado"];

const statusStyles = {
  Pendiente: "bg-amber-50 text-amber-600",
  Procesando: "bg-blue-50 text-blue-600",
  Enviado: "bg-violet-50 text-violet-600",
  Entregado: "bg-emerald-50 text-emerald-600",
};

const stepIcons = [CircleDashed, Check, Truck, PackageCheck];

function OrderDetails() {
  const { id } = useParams();
  const { reorderItems } = useContext(CartContext);

  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loadingState, setLoadingState] = useState("loading");
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);

        setOrder(data);
        setLoadingState("ready");
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ?? "No se pudo cargar la orden"
        );
        setLoadingState("error");
      }
    };

    fetchOrder();
  }, [id]);

  const handleReorder = () => {
    setReordering(true);

    const items = order.orderItems.map((item) => ({
      _id: String(item.product?._id ?? item.product),
      title: item.title,
      image: item.image,
      price: item.price,
      stock: item.product?.stock ?? 0,
      qty: item.qty,
    }));

    const { addedCount, skipped } = reorderItems(items);

    if (addedCount > 0) {
      toast.success(
        `${addedCount} ${
          addedCount === 1 ? "producto añadido" : "productos añadidos"
        } al carrito`
      );
    }

    for (const title of skipped) {
      toast.error(`"${title}" no está disponible en esa cantidad`);
    }

    setTimeout(() => setReordering(false), 600);
  };

  if (loadingState === "error") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-brand-500">{error}</p>

        <Link to="/profile" className="btn-secondary mt-6 inline-flex">
          <ArrowLeft size={15} /> Volver a mis órdenes
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="card h-40 animate-pulse" />
        <div className="card mt-6 h-64 animate-pulse" />
      </div>
    );
  }

  const subtotal = order.orderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const shipping =
    Math.round((order.totalPrice - subtotal) * 100) / 100;

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Encabezado */}
      <nav aria-label="Miga de pan" className="animate-fade-in-up mb-8">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-sm text-brand-400 transition-colors hover:text-brand-800"
        >
          <ArrowLeft size={15} /> Mis órdenes
        </Link>
      </nav>

      <div className="animate-fade-in-up anim-delay-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-900">
            Orden #{order._id.slice(-6).toUpperCase()}
          </h1>

          <p className="mt-1 text-sm text-brand-400">
            Realizada el{" "}
            {new Date(order.createdAt).toLocaleDateString("es", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            statusStyles[order.status] ?? "bg-brand-50 text-brand-500"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Timeline de estado */}
      <section className="card animate-fade-in-up anim-delay-200 mt-8 p-6">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-brand-400">
          Estado del pedido
        </h2>

        <ol className="flex flex-col gap-0 sm:flex-row sm:items-start">
          {STATUS_STEPS.map((step, index) => {
            const Icon = stepIcons[index];
            const done = index <= currentStep;
            const isLast = index === STATUS_STEPS.length - 1;

            return (
              <li
                key={step}
                className={`flex flex-1 items-center gap-3 sm:flex-col sm:gap-2 sm:text-center ${
                  isLast ? "" : ""
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                    done
                      ? "bg-brand-800 text-white"
                      : "bg-brand-100 text-brand-400"
                  }`}
                >
                  <Icon size={18} />
                </span>

                <span
                  className={`text-sm font-medium ${
                    done ? "text-brand-900" : "text-brand-400"
                  }`}
                >
                  {step}
                </span>

                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={`hidden h-0.5 flex-1 sm:block ${
                      index < currentStep
                        ? "bg-brand-800"
                        : "bg-brand-100"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* Productos */}
      <section className="card animate-fade-in-up anim-delay-300 mt-6 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-400">
          Productos ({order.orderItems.length})
        </h2>

        <ul className="divide-y divide-brand-100">
          {order.orderItems.map((item, index) => {
            const productId = String(item.product?._id ?? item.product);
            const available = item.product?.stock ?? 0;
            const soldOut = available <= 0;

            return (
              <li
                key={index}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.visibility = "hidden";
                  }}
                  className="h-16 w-16 shrink-0 rounded-xl bg-brand-50 object-cover"
                />

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/products/${productId}`}
                    className="block truncate font-semibold text-brand-900 transition-colors hover:text-brand-600"
                  >
                    {item.title}
                  </Link>

                  <p className="mt-0.5 text-sm text-brand-400">
                    ${Number(item.price).toFixed(2)} × {item.qty}
                    {soldOut && (
                      <span className="ml-2 text-red-500">(agotado)</span>
                    )}
                  </p>
                </div>

                <p className="font-bold text-accent-500">
                  ${(Number(item.price) * item.qty).toFixed(2)}
                </p>
              </li>
            );
          })}
        </ul>

        <dl className="mt-5 space-y-2 border-t border-brand-100 pt-5 text-sm">
          <div className="flex justify-between text-brand-500">
            <dt>Subtotal</dt>
            <dd>${subtotal.toFixed(2)}</dd>
          </div>

          <div className="flex justify-between text-brand-500">
            <dt>Envío</dt>
            <dd>{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</dd>
          </div>

          <div className="flex justify-between border-t border-brand-100 pt-3 text-base font-bold text-brand-900">
            <dt>Total</dt>
            <dd className="text-accent-500">
              ${Number(order.totalPrice).toFixed(2)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Volver a comprar */}
      <button
        onClick={handleReorder}
        disabled={reordering}
        className="btn-primary animate-fade-in-up anim-delay-300 mt-6 w-full !py-3.5 sm:w-auto"
      >
        <RotateCcw
          size={17}
          className={reordering ? "animate-spin" : undefined}
        />
        Volver a comprar
      </button>
    </div>
  );
}

export default OrderDetails;
