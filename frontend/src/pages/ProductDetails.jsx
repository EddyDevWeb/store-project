import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Loader2, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { CartContext } from "../context/cartContext";
import { AuthContext } from "../context/authContext";
import Stars from "../components/Stars";
import { ProductDetailsSkeleton } from "../components/Skeleton";

function ProductDetails() {
  const { addToCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myHover, setMyHover] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoaded(false);

      try {
        const { data } = await api.get(`/reviews/${id}`);

        setReviews(data);
      } catch (error) {
        console.error(error);
      } finally {
        setReviewsLoaded(true);
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    const checkPurchase = async () => {
      if (!userInfo) {
        setHasPurchased(false);
        return;
      }

      try {
        const { data } = await api.get(
          `/orders/has-purchased/${id}`
        );

        setHasPurchased(Boolean(data.purchased));
      } catch (error) {
        console.error(error);
      }
    };

    checkPurchase();
  }, [id, userInfo]);

  if (!product) {
    return <ProductDetailsSkeleton />;
  }

  const outOfStock = product.stock <= 0;
  const alreadyReviewed =
    userInfo &&
    reviews.some((review) => review.user?._id === userInfo._id);
  const canReview = userInfo && hasPurchased && !alreadyReviewed;

  const handleAddToCart = () => {
    setAdding(true);
    addToCart(product);

    setTimeout(() => {
      setAdding(false);
    }, 600);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (myRating < 1 || myRating > 5) {
      toast.error("Selecciona una valoración de 1 a 5 estrellas");
      return;
    }

    setSubmittingReview(true);

    try {
      const { data } = await api.post(`/reviews/${id}`, {
        rating: myRating,
        comment: myComment,
      });

      setReviews((prev) => [data, ...prev]);

      const avg =
        reviews.reduce((acc, review) => acc + review.rating, data.rating) /
        (reviews.length + 1);

      setProduct((prev) =>
        prev
          ? {
              ...prev,
              ratingAvg: Math.round(avg * 10) / 10,
              ratingCount: reviews.length + 1,
            }
          : prev
      );

      toast.success("¡Gracias por tu opinión!");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ??
          "No se pudo publicar tu reseña"
      );
    } finally {
      setSubmittingReview(false);
    }
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

          {product.ratingCount > 0 && (
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-brand-500">
              <Stars value={product.ratingAvg} size={15} />
              {product.ratingAvg.toFixed(1)} ·{" "}
              {product.ratingCount}{" "}
              {product.ratingCount === 1 ? "opinión" : "opiniones"}
            </p>
          )}

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
          </div>          <button
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

      {/* Reseñas */}
      <section className="card animate-fade-in-up mt-12 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-brand-900">
            Opiniones de compradores
          </h2>

          {reviews.length > 0 && (
            <p className="flex items-center gap-2 text-sm font-medium text-brand-500">
              <Stars value={product.ratingAvg} size={16} />
              {product.ratingAvg.toFixed(1)} de 5 ·{" "}
              {product.ratingCount}{" "}
              {product.ratingCount === 1 ? "opinión" : "opiniones"}
            </p>
          )}
        </div>

        {canReview && (
          <form
            onSubmit={handleSubmitReview}
            className="mt-6 rounded-2xl bg-brand-50 p-5"
          >
            <h3 className="text-sm font-semibold text-brand-800">
              Deja tu opinión sobre este producto
            </h3>

            <div className="mt-3 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setMyRating(star)}
                  onMouseEnter={() => setMyHover(star)}
                  onMouseLeave={() => setMyHover(0)}
                  aria-label={`Valorar con ${star} ${
                    star === 1 ? "estrella" : "estrellas"
                  }`}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    size={26}
                    className={
                      star <= (myHover || myRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-brand-300"
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              value={myComment}
              onChange={(event) => setMyComment(event.target.value)}
              placeholder="Cuéntanos tu experiencia con el producto (opcional)..."
              rows={3}
              maxLength={600}
              className="input-field mt-3 w-full resize-none"
            />

            <button
              type="submit"
              disabled={submittingReview || myRating === 0}
              className="btn-primary mt-3 !py-2.5 text-sm"
            >
              {submittingReview ? (
                <>
                  <Loader2 size={15} className="animate-spin" />{" "}
                  Publicando...
                </>
              ) : (
                "Publicar opinión"
              )}
            </button>
          </form>
        )}

        {!userInfo && (
          <p className="mt-6 rounded-2xl bg-brand-50 px-5 py-4 text-sm text-brand-500">
            <Link
              to="/login"
              className="font-semibold text-brand-800 hover:underline"
            >
              Inicia sesión
            </Link>{" "}
            y compra este producto para poder opinar.
          </p>
        )}

        {userInfo && hasPurchased && alreadyReviewed && (
          <p className="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-600">
            Ya publicaste tu opinión sobre este producto. ¡Gracias!
          </p>
        )}

        {userInfo && !hasPurchased && reviewsLoaded && (
          <p className="mt-6 rounded-2xl bg-brand-50 px-5 py-4 text-sm text-brand-500">
            Solo quienes han comprado este producto pueden dejar una
            opinión.
          </p>
        )}

        {reviewsLoaded && reviews.length > 0 ? (
          <ul className="mt-6 divide-y divide-brand-100">
            {reviews.map((review) => (
              <li key={review._id} className="py-5 first:pt-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {review.user?.name?.charAt(0).toUpperCase() ?? "?"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-900">
                      {review.user?.name ?? "Usuario"}
                    </p>

                    <p className="text-xs text-brand-400">
                      {new Date(review.createdAt).toLocaleDateString("es", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <Stars value={review.rating} size={14} />
                </div>

                {review.comment && (
                  <p className="mt-3 pl-12 text-sm leading-relaxed text-brand-600">
                    {review.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          reviewsLoaded && (
            <p className="mt-6 text-sm text-brand-400">
              Este producto todavía no tiene opiniones.
            </p>
          )
        )}
      </section>
    </div>
  );
}

export default ProductDetails;
