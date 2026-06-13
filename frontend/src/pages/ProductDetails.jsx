import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(
          `/products/${id}`
        );

        setProduct(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="text-center py-20">
        Cargando producto...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      <div className="grid md:grid-cols-2 gap-12">

        <div>
          <img
            src={product.image}
            alt={product.title}
            className="w-full rounded-2xl shadow-lg"
          />
        </div>

        <div>

          <span className="inline-block bg-blue-100 text-[#4A6FA5] px-4 py-2 rounded-full mb-4">
            {product.category}
          </span>

          <h1 className="text-5xl font-bold text-[#2D3748]">
            {product.title}
          </h1>

          <p className="text-4xl font-bold text-[#D4A373] mt-6">
            ${product.price}
          </p>

          <div className="mt-6">
            <span
              className={`px-4 py-2 rounded-full ${
                product.stock > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.stock > 0
                ? `${product.stock} disponibles`
                : "Agotado"}
            </span>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-3">
              Descripción
            </h2>

            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <button
            className="mt-10 bg-[#4A6FA5] text-white px-8 py-4 rounded-xl hover:bg-[#3D5F91] transition"
          >
            Agregar al carrito
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProductDetails;