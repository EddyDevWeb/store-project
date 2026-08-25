import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Lock, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { CartContext } from "../context/cartContext";
import api from "../services/api";
import toast from "react-hot-toast";
import EmptyState from "../components/EmptyState";

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 9.99;

function Cart() {
  const {
    cartItems,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
  } = useContext(CartContext);

  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  const total = subtotal + shipping;

  const missingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal
  );

  const checkoutHandler = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Inicia sesión para finalizar tu compra");
      navigate("/login");
      return;
    }

    setCheckingOut(true);

    try {
      const orderItems = cartItems.map((item) => ({
        product: item._id,
        title: item.title,
        image: item.image,
        price: item.price,
        qty: item.qty,
      }));

      const { data } = await api.post(
        "/payments/checkout-session",
        { orderItems }
      );

      toast.success("Redirigiendo a Stripe...");

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ?? "Error al procesar la compra"
      );
    } finally {
      setCheckingOut(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Tu carrito está vacío"
          description="Explora el catálogo y encuentra todo lo que necesitas para tu setup."
          action={
            <Link to="/products" className="btn-primary">
              Ver productos <ArrowRight size={16} />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="animate-fade-in-up text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
        Carrito de compras
      </h1>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="animate-fade-in-up anim-delay-100 space-y-4">
          {cartItems.map((item) => (
            <article key={item._id} className="card flex gap-5 p-4 sm:p-5">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="h-24 w-24 shrink-0 rounded-xl bg-brand-50 object-cover sm:h-28 sm:w-28"
              />

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-brand-900">
                      {item.title}
                    </h3>

                    <p className="mt-0.5 text-xs text-brand-400">{item.category}</p>

                    <p className="mt-2 font-bold text-accent-500">
                      ${Number(item.price).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    aria-label={`Eliminar ${item.title} del carrito`}
                    className="rounded-xl p-2 text-brand-300 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Stepper */}
                <div className="mt-auto flex items-center gap-1 pt-3">
                  <button
                    onClick={() => decreaseQty(item._id)}
                    aria-label="Disminuir cantidad"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-200 text-brand-600 transition-colors hover:bg-brand-50"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="w-9 text-center text-sm font-bold text-brand-900">
                    {item.qty}
                  </span>

                  <button
                    onClick={() => increaseQty(item._id)}
                    disabled={item.qty >= item.stock}
                    title={
                      item.qty >= item.stock
                        ? `Máximo ${item.stock} disponible(s)`
                        : undefined
                    }
                    aria-label="Aumentar cantidad"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-200 text-brand-600 transition-colors hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>

                  {item.qty >= item.stock && (
                    <span className="ml-2 text-xs font-medium text-accent-700">
                      Máx. {item.stock}
                    </span>
                  )}

                  <span className="ml-auto hidden text-sm font-semibold text-brand-500 sm:block">
                    Subtotal: ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              </div>
            </article>
          ))}

          <button
            onClick={clearCart}
            className="btn-secondary !text-red-500 hover:!bg-red-50"
          >
            <Trash2 size={15} /> Vaciar carrito
          </button>
        </div>

        {/* Resumen sticky */}
        <aside className="card animate-fade-in-up anim-delay-200 sticky top-24 p-6">
          <h2 className="text-lg font-bold text-brand-900">Resumen del pedido</h2>

          {missingForFreeShipping > 0 && (
            <p className="mt-3 rounded-xl bg-accent-100 px-4 py-3 text-xs font-medium leading-relaxed text-accent-700">
              Te faltan ${missingForFreeShipping.toFixed(2)} para obtener{" "}
              <strong>envío gratis</strong>.
            </p>
          )}

          <dl className="mt-5 space-y-3.5 border-t border-brand-100 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-brand-500">Subtotal</dt>
              <dd className="font-semibold text-brand-800">
                ${subtotal.toFixed(2)}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-brand-500">Envío</dt>
              <dd className="font-semibold text-brand-800">
                {shipping === 0 ? (
                  <span className="text-emerald-600">Gratis</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </dd>
            </div>

            <div className="flex justify-between border-t border-dashed border-brand-200 pt-4 text-base">
              <dt className="font-bold text-brand-900">Total</dt>
              <dd className="text-xl font-bold text-accent-500">
                ${total.toFixed(2)}
              </dd>
            </div>
          </dl>

          <button
            onClick={checkoutHandler}
            disabled={checkingOut}
            className="btn-primary mt-6 w-full !py-4"
          >
            {checkingOut ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Redirigiendo...
              </>
            ) : (
              <>
                <Lock size={16} /> Pagar con tarjeta (Stripe)
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-brand-400">
            Pago seguro con Stripe · Devolución en 30 días
          </p>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
