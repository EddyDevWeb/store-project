import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Loader2, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import api from "../services/api";
import { CartContext } from "../context/cartContext";
import { ProductDetailsSkeleton } from "../components/Skeleton";

function ProductDetails() {
  const { addToCart } = useContext(CartContext);
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);

        setProduct(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <ProductDetailsSkeleton />;
  }

  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    setAdding(true);
    addToCart(product);

    setTimeout(() => {
      setAdding(false);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Miga de pan"
        className="animate-fade-in-up mb-8 flex items-center gap-1.5 text-sm text-brand-400"
      >
        <Link to="/products" className="inline-flex items-center gap-1 transition-colors hover:text-brand-800">
          <ArrowLeft size={15} /> Productos
        </Link>

        <ChevronRight size={14} />

        <span className="max-w-[200px] truncate font-medium text-brand-600 sm:max-w-none">
          {product.title}
        </span>
      </nav>

      <div className="animate-fade-in-up anim-delay-100 grid gap-12 md:grid-cols-2">
        {/* Imagen */}
        <div className="card overflow-hidden bg-brand-50 p-0">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        {/* Información */}
        <div>
          <span className="inline-block rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-500">
            {product.category}
          </span>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-brand-900 sm:text-4xl">
            {product.title}
          </h1>

          <p className="mt-5 text-4xl font-bold text-accent-500">
            ${Number(product.price).toFixed(2)}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                outOfStock
                  ? "bg-red-50 text-red-600"
                  : product.stock <= 5
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {outOfStock
                ? "Agotado"
                : product.stock <= 5
                  ? `¡Últimas unidades! Solo quedan ${product.stock}`
                  : `${product.stock} disponibles`}
            </span>

            {!outOfStock && product.stock <= 5 && (
              <span className="text-sm font-medium text-accent-700">
                ¡Últimas unidades!
              </span>
            )}
          </div>

          <div className="mt-8 border-t border-brand-100 pt-8">
            <h2 className="text-lg font-semibold text-brand-900">Descripción</h2>

            <p className="mt-3 leading-relaxed text-brand-500">
              {product.description}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={outOfStock || adding}
            className="btn-primary mt-8 w-full !py-4 text-base sm:w-auto sm:!px-10"
          >
            {adding ? (
              <>
                <Loader2 size={19} className="animate-spin" /> Agregando...
              </>
            ) : outOfStock ? (
              "Sin stock disponible"
            ) : (
              <>
                <ShoppingCart size={19} /> Agregar al carrito
              </>
            )}
          </button>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-brand-100 pt-6 text-sm">
            <div className="flex items-center gap-2.5 text-brand-500">
              <Truck size={18} className="shrink-0 text-brand-400" />
              Envío gratis en compras +$50
            </div>

            <div className="flex items-center gap-2.5 text-brand-500">
              <ShieldCheck size={18} className="shrink-0 text-brand-400" />
              30 días para devoluciones
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
