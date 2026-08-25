import { useContext, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Package,
  XCircle,
} from "lucide-react";
import api from "../services/api";
import { CartContext } from "../context/cartContext";

function PagoExitoso() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  const { clearCart } = useContext(CartContext);

  const [state, setState] = useState("verificando");
  const [order, setOrder] = useState(null);

  const cartClearedRef = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setState("error");
        return;
      }

      try {
        const { data } = await api.get(
          `/payments/verify/${sessionId}`
        );

        setOrder(data.order);
        setState(data.paid ? "pagado" : "pendiente");

        if (data.paid && !cartClearedRef.current) {
          cartClearedRef.current = true;
          clearCart();
        }
      } catch (error) {
        console.error(error);
        setState("error");
      }
    };

    verify();
  }, [sessionId, clearCart]);

  return (
    <div className="mx-auto flex max-w-lg flex-col px-6 py-20 text-center">
      {state === "verificando" && (
        <div className="animate-fade-in-up">
          <Loader2
            size={56}
            className="mx-auto animate-spin text-brand-400"
          />

          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-brand-900">
            Verificando tu pago...
          </h1>

          <p className="mt-2 text-sm text-brand-500">
            Un momento, estamos confirmando la transacción con
            Stripe.
          </p>
        </div>
      )}

      {state === "pagado" && (
        <div className="animate-scale-in">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <CheckCircle2 size={44} />
          </span>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-brand-900">
            ¡Pago confirmado!
          </h1>

          <p className="mt-3 leading-relaxed text-brand-500">
            Gracias por tu compra
            {order ? `, ${order.user?.name ?? ""}` : ""}. Tu orden{" "}
            <strong className="text-brand-900">
              #{orderId?.slice(-6).toUpperCase()}
            </strong>{" "}
            por{" "}
            <span className="font-bold text-accent-500">
              ${Number(order?.totalPrice ?? 0).toFixed(2)}
            </span>{" "}
            quedó registrada y pagada.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={`/pedidos/${orderId}`}
              className="btn-primary"
            >
              <Package size={16} /> Ver mi pedido
            </Link>

            <Link to="/products" className="btn-secondary">
              Seguir comprando <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {(state === "error" || state === "pendiente") && (
        <div className="animate-fade-in-up">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <XCircle size={44} />
          </span>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-brand-900">
            No pudimos confirmar el pago
          </h1>

          <p className="mt-3 leading-relaxed text-brand-500">
            Si completaste el pago, tu orden quedará marcada como
            pagada en unos minutos. Revisa tus órdenes en tu
            perfil.
          </p>

          <Link to="/profile" className="btn-primary mt-8 inline-flex">
            Ir a mis órdenes <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default PagoExitoso;
