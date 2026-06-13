import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import {
  Laptop,
  Gamepad2,
  Monitor,
  Cpu
} from "lucide-react";
function Home() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");

      setProducts(data.slice(0, 4));
    } catch (error) {
      console.error(error);
    }
  };

  fetchProducts();
}, []);

    return (
        <div>
           <section className="bg-gradient-to-r from-[#4A6FA5] to-[#6B8BB8] text-white">
  <div className="max-w-7xl mx-auto px-6 py-24">

    <div className="max-w-3xl">
      <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
        Tecnología Premium
      </span>

      <h1 className="text-6xl font-bold mt-6 leading-tight">
        Construye tu setup ideal
      </h1>

      <p className="mt-6 text-xl text-gray-100">
        Componentes, periféricos y accesorios
        seleccionados para gamers,
        estudiantes y profesionales.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          to="/products"
          className="bg-white text-[#4A6FA5] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
        >
          Ver Productos
        </Link>

        <Link
          to="/register"
          className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-[#4A6FA5] transition"
        >
          Crear Cuenta
        </Link>
      </div>
    </div>

  </div>
</section>
            <section className="max-w-7xl mx-auto px-6 py-16">
  <h2 className="text-3xl font-bold text-center text-[#2D3748] mb-10">
    Categorías
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

    <div className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl hover:-translate-y-1 transition">
      <Laptop
        size={50}
        className="mx-auto text-[#4A6FA5]"
      />

      <h3 className="mt-4 font-semibold">
        Laptops
      </h3>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl hover:-translate-y-1 transition">
      <Gamepad2
        size={50}
        className="mx-auto text-[#4A6FA5]"
      />

      <h3 className="mt-4 font-semibold">
        Gaming
      </h3>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl hover:-translate-y-1 transition">
      <Monitor
        size={50}
        className="mx-auto text-[#4A6FA5]"
      />

      <h3 className="mt-4 font-semibold">
        Monitores
      </h3>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl hover:-translate-y-1 transition">
      <Cpu
        size={50}
        className="mx-auto text-[#4A6FA5]"
      />

      <h3 className="mt-4 font-semibold">
        Componentes
      </h3>
    </div>

  </div>
</section>
        </div>
    );
}

export default Home;