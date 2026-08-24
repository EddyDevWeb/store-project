import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#eef2f7"/><g fill="none" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><rect x="140" y="100" width="120" height="80" rx="8"/><path d="M120 200h160"/></g></svg>`
  );

function ProductCard({ product }) {
  const outOfStock = product.stock <= 0;

  const handleImageError = (event) => {
    if (!event.currentTarget.dataset.fallback) {
      event.currentTarget.dataset.fallback = "true";
      event.currentTarget.src = FALLBACK_IMAGE;
    }
  };

  return (
    <article className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
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
      </Link>

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
