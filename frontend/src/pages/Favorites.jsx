import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, PackageSearch } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import { ProductCardSkeleton } from "../components/Skeleton";
import { FavoritesContext } from "../context/favoritesContext";

function Favorites() {
  const { favoriteIds } = useContext(FavoritesContext);
  const [products, setProducts] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data } = await api.get("/users/favorites");

        setProducts(data);
      } catch (error) {
        console.error(error);
        setProducts([]);
      }
    };

    fetchFavorites();
  }, []);

  const visibleProducts =
    products?.filter((product) =>
      favoriteIds.includes(product._id)
    ) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="animate-fade-in-up mb-10">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-brand-900 sm:text-5xl">
          Mis favoritos
          <Heart size={30} className="fill-red-500 text-red-500" />
        </h1>

        <p className="mt-3 max-w-xl text-brand-500">
          Tu lista personal de productos guardados. El corazón recuerda
          lo que te interesa.
        </p>
      </div>

      {products === null ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : visibleProducts.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Todavía no tienes favoritos"
          description="Pulsa el corazón de cualquier producto para guardarlo aquí y encontrarlo fácilmente después."
          action={
            <Link to="/products" className="btn-primary">
              Explorar productos
            </Link>
          }
        />
      ) : (
        <>
          <p className="animate-fade-in-up anim-delay-100 mb-6 text-sm font-medium text-brand-400">
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1
              ? "producto guardado"
              : "productos guardados"}
          </p>

          <div className="animate-scale-in grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Favorites;
