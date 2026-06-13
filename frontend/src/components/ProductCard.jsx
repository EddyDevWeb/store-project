import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">

      <div className="overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-60 object-cover group-hover:scale-110 transition duration-500"
        />
      </div>

      <div className="p-5">

        <span className="inline-block bg-blue-100 text-[#4A6FA5] text-sm px-3 py-1 rounded-full mb-3">
          {product.category}
        </span>

        <h3 className="text-xl font-bold text-[#2D3748] line-clamp-2">
          {product.title}
        </h3>

        <p className="text-gray-500 mt-2 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-5">

          <span className="text-2xl font-bold text-[#D4A373]">
            ${product.price}
          </span>

          <span
            className={`text-sm px-3 py-1 rounded-full ${
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

        <Link
          to={`/products/${product._id}`}
          className="mt-5 block text-center bg-[#4A6FA5] text-white py-3 rounded-xl hover:bg-[#3D5F91] transition"
        >
          Ver Detalles
        </Link>

      </div>
    </div>
  );
}

export default ProductCard;