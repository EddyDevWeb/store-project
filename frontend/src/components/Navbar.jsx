import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { userInfo, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const logoutHandler = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-18">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#4A6FA5] to-[#6B8BB8] flex items-center justify-center text-white font-bold">
              T
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#2D3748]">
                TechStore
              </h1>

              <p className="text-xs text-gray-500">
                Tecnología Premium
              </p>
            </div>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">

            <Link
              to="/"
              className="font-medium text-gray-600 hover:text-[#4A6FA5] transition"
            >
              Inicio
            </Link>

            <Link
              to="/products"
              className="font-medium text-gray-600 hover:text-[#4A6FA5] transition"
            >
              Productos
            </Link>

            {userInfo?.role === "admin" && (
              <Link
                to="/admin"
                className="font-medium text-gray-600 hover:text-[#4A6FA5] transition"
              >
                Dashboard
              </Link>
            )}

            {!userInfo && (
              <Link
                to="/login"
                className="bg-[#4A6FA5] text-white px-5 py-2 rounded-lg hover:bg-[#3D5F91] transition"
              >
                Iniciar Sesión
              </Link>
            )}

            {userInfo && (
              <div className="flex items-center gap-4">

                <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-[#4A6FA5] text-white flex items-center justify-center font-semibold">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#2D3748]">
                      {userInfo.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {userInfo.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={logoutHandler}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Salir
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;