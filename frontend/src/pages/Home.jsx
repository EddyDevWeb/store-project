import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Cpu,
  Gamepad2,
  Headset,
  Laptop,
  Monitor,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { ProductCardSkeleton } from "../components/Skeleton";

const categories = [
  { name: "Laptops", icon: Laptop },
  { name: "Gaming", icon: Gamepad2 },
  { name: "Monitores", icon: Monitor },
  { name: "Componentes", icon: Cpu },
];

const trustItems = [
  { icon: Truck, title: "Envío rápido", text: "Gratis en compras +$50" },
  { icon: PackageCheck, title: "Garantía real", text: "30 días de devolución" },
  { icon: RotateCcw, title: "Compra segura", text: "Protegemos tus datos" },
  { icon: Headset, title: "Soporte experto", text: "Atención personalizada" },
];

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");

        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-brand-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28">
          <div className="max-w-3xl">
            <span className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-600 uppercase">
              Tecnología Premium
            </span>

            <h1 className="animate-fade-in-up anim-delay-100 mt-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-brand-900 sm:text-6xl">
              Construye tu setup ideal.
            </h1>

            <p className="animate-fade-in-up anim-delay-200 mt-6 max-w-xl text-lg leading-relaxed text-brand-500">
              Componentes, periféricos y accesorios seleccionados para
              gamers, estudiantes y profesionales que no negocian calidad.
            </p>

            <div className="animate-fade-in-up anim-delay-300 mt-9 flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary !px-7 !py-3.5">
                Explorar catálogo <ArrowRight size={17} />
              </Link>

              <Link to="/register" className="btn-secondary !px-7 !py-3.5">
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de confianza */}
      <section className="border-b border-brand-100 bg-brand-50/60">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-6 py-10 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.title} className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-soft">
                <item.icon size={20} strokeWidth={1.8} />
              </span>

              <span>
                <span className="block text-sm font-semibold text-brand-900">
                  {item.title}
                </span>
                <span className="block text-xs text-brand-400">{item.text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-brand-900">
          Explora por categoría
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
          {categories.map(({ name, icon: Icon }) => (
            <Link
              key={name}
              to={`/products?cat=${encodeURIComponent(name)}`}
              className="card group flex flex-col items-center p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-800 group-hover:text-white">
                <Icon size={26} strokeWidth={1.6} />
              </span>

              <h3 className="mt-4 font-semibold text-brand-900">{name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-brand-900">
              Destacados
            </h2>

            <p className="mt-2 text-sm text-brand-400">
              Una selección de lo más buscado esta semana.
            </p>
          </div>

          <Link
            to="/products"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900 sm:inline-flex"
          >
            Ver todo <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
