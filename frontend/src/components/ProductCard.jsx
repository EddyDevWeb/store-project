import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../context/authContext";
import { FavoritesContext } from "../context/favoritesContext";
import Stars from "./Stars";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#eef2f7"/><g fill="none" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><rect x="140" y="100" width="120" height="80" rx="8"/><path d="M120 200h160"/></g></svg>`
  );

function ProductCard({ product }) {
  const { userInfo } = useContext(AuthContext);
  const { favoriteIds, toggleFavorite } = useContext(FavoritesContext);
  const navigate = useNavigate();

  const outOfStock = product.stock <= 0;
  const isFavorite = favoriteIds.includes(product._id);

  const handleToggleFavorite = async () => {
    if (!userInfo) {
      toast.error("Inicia sesión para guardar favoritos");
      navigate("/login");
      return;
    }

    try {
      const nowFavorite = await toggleFavorite(product._id);

      toast.success(
        nowFavorite
          ? "Añadido a favoritos ❤️"
          : "Eliminado de favoritos"
      );
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar tus favoritos");
    }
  };

  const handleImageError = (event) => {
    if (!event.currentTarget.dataset.fallback) {
      event.currentTarget.dataset.fallback = "true";
      event.currentTarget.src = FALLBACK_IMAGE;
    }
  };

  return (
    <article className="card group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/products/${product._id}`} className="relative block overflow-hidden bg-brand-50">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          onError={handleImageError}
          className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {outOfStock && (
          <span className="absolute left-4 top-4 rounded-full bg-brand-900/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Agotado
          </span>
        )}

        {!outOfStock && product.stock <= 5 && (
          <span className="animate-badge-pop absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
            ¡Últimas unidades!
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={handleToggleFavorite}
        aria-label={
          isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"
        }
        aria-pressed={isFavorite}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-90"
      >
        <Heart
          size={17}
          className={
            isFavorite
              ? "fill-red-500 text-red-500"
              : "text-brand-600 transition-colors hover:text-red-500"
          }
        />
      </button>

      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 inline-block w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-500">
          {product.category}
        </span>

        <Link to={`/products/${product._id}`}>
          <h3 className="line-clamp-2 font-semibold leading-snug text-brand-900 transition-colors group-hover:text-brand-600">
            {product.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-400">
          {product.description}
        </p>

        {product.ratingCount > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand-500">
            <Stars value={product.ratingAvg} size={13} />
            {product.ratingAvg.toFixed(1)} ({product.ratingCount})
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-xl font-bold text-accent-500">
            ${Number(product.price).toFixed(2)}
          </span>

          {!outOfStock && product.stock <= 5 && (
            <span className="text-xs font-medium text-brand-400">
              ¡Solo {product.stock}!
            </span>
          )}
        </div>

        {outOfStock ? (
          <button disabled className="btn-primary mt-4 w-full opacity-40">
            Sin stock
          </button>
        ) : (
          <Link to={`/products/${product._id}`} className="btn-primary mt-4 w-full">
            Ver detalles
          </Link>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
