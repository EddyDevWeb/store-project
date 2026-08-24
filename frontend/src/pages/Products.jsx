import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageSearch, Search, X } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import { ProductCardSkeleton } from "../components/Skeleton";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("cat") ?? "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");

        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      !activeCategory || product.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const selectCategory = (category) => {
    if (category) {
      setSearchParams({ cat: category });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="animate-fade-in-up mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-brand-900 sm:text-5xl">
          Nuestros productos
        </h1>

        <p className="mt-3 max-w-xl text-brand-500">
          Descubre componentes, periféricos y accesorios seleccionados para
          potenciar tu experiencia.
        </p>
      </div>

      {/* Buscador + filtros */}
      <div className="card animate-fade-in-up anim-delay-100 mb-8 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-400"
            />

            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar productos"
              className="input-field !pl-11"
            />
          </div>

          <span className="shrink-0 text-sm font-medium text-brand-400">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "producto" : "productos"}{" "}
            encontrados
          </span>
        </div>

        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-100 pt-4">
            <button
              onClick={() => selectCategory("")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                !activeCategory
                  ? "bg-brand-800 text-white"
                  : "bg-brand-50 text-brand-500 hover:bg-brand-100 hover:text-brand-800"
              }`}
            >
              Todas
            </button>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => selectCategory(category)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  activeCategory === category
                    ? "bg-brand-800 text-white"
                    : "bg-brand-50 text-brand-500 hover:bg-brand-100 hover:text-brand-800"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={activeCategory || searchTerm ? "Sin coincidencias" : "Catálogo vacío"}
          description={
            activeCategory || searchTerm
              ? `No encontramos productos${
                  searchTerm ? ` para "${searchTerm}"` : ""
                }${activeCategory ? ` en ${activeCategory}` : ""}. Prueba con otra búsqueda o quita los filtros.`
              : "Todavía no hay productos disponibles. Vuelve a intentarlo más tarde."
          }
          action={
            (activeCategory || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  selectCategory("");
                }}
                className="btn-secondary"
              >
                <X size={15} /> Limpiar filtros
              </button>
            )
          }
        />
      ) : (
        <div className="animate-scale-in grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
