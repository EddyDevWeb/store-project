import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";

function PagoCancelado() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="mx-auto flex max-w-lg flex-col px-6 py-20 text-center">
      <div className="animate-fade-in-up">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-500">
          <CreditCard size={42} />
        </span>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-brand-900">
          Pago cancelado
        </h1>

        <p className="mt-3 leading-relaxed text-brand-500">
          No se realizó ningún cargo
          {orderId ? (
            <>
              {" "}
              para la orden{" "}
              <strong className="text-brand-900">
                #{orderId.slice(-6).toUpperCase()}
              </strong>
            </>
          ) : null}
          . Tu carrito sigue disponible por si quieres volver a
          intentarlo.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/cart" className="btn-primary">
            Volver al carrito
          </Link>

          <Link to="/products" className="btn-secondary">
            <ArrowLeft size={15} /> Seguir explorando
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PagoCancelado;
