import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { CartContext } from "../context/cartContext";
import { FavoritesContext } from "../context/favoritesContext";
import { Heart, LayoutDashboard, LogOut, Menu, ShoppingCart, User, X } from "lucide-react";

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/products", label: "Productos" },
];

function Navbar() {
  const { userInfo, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { favoriteIds } = useContext(FavoritesContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const logoutHandler = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  const count = cartItems.length;

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? "text-brand-900"
        : "text-brand-500 hover:text-brand-900"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-baseline gap-0.5" aria-label="TechStore — Inicio">
            <span className="text-xl font-extrabold tracking-tight text-brand-900">
              Tech
            </span>
            <span className="text-xl font-light tracking-tight text-brand-400">
              Store
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === "/"}>
                {link.label}
              </NavLink>
            ))}

            {userInfo?.role === "admin" && (
              <NavLink to="/admin" className={linkClass}>
                Panel Admin
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {userInfo && (
              <Link
                to="/favoritos"
                aria-label={`Favoritos, ${favoriteIds.length} ${
                  favoriteIds.length === 1 ? "producto" : "productos"
                }`}
                className="relative rounded-xl p-2.5 text-brand-600 transition-colors hover:bg-brand-50 hover:text-red-500"
              >
                <Heart size={21} strokeWidth={1.8} />

                {favoriteIds.length > 0 && (
                  <span
                    key={favoriteIds.length}
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-badge-pop items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white"
                  >
                    {favoriteIds.length}
                  </span>
                )}
              </Link>
            )}

            <Link
              to="/cart"
              aria-label={`Carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
              className="relative rounded-xl p-2.5 text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-900"
            >
              <ShoppingCart size={21} strokeWidth={1.8} />

              {count > 0 && (
                <span
                  key={count}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-badge-pop items-center justify-center rounded-full bg-brand-800 px-1 text-[11px] font-bold text-white"
                >
                  {count}
                </span>
              )}
            </Link>

            {!userInfo && (
              <Link to="/login" className="btn-primary hidden !py-2.5 sm:inline-flex">
                Iniciar sesión
              </Link>
            )}

            {userInfo && (
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-brand-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {userInfo.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="leading-tight">
                    <span className="block text-sm font-semibold text-brand-900">
                      {userInfo.name}
                    </span>
                    <span className="block text-xs capitalize text-brand-400">
                      {userInfo.role}
                    </span>
                  </span>
                </Link>

                <button
                  onClick={logoutHandler}
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                  className="rounded-xl p-2.5 text-brand-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={19} strokeWidth={1.8} />
                </button>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="rounded-xl p-2.5 text-brand-700 transition-colors hover:bg-brand-50 md:hidden"
            >
              <Menu size={22} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer móvil */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
          <button
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
          />

          <div className="animate-slide-in-right absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
              <span className="text-lg font-extrabold tracking-tight text-brand-900">
                Tech<span className="font-light text-brand-400">Store</span>
              </span>

              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="rounded-xl p-2 text-brand-500 transition-colors hover:bg-brand-50"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-4" aria-label="Menú móvil">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-900"
                        : "text-brand-500 hover:bg-brand-50 hover:text-brand-900"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {userInfo?.role === "admin" && (
                <NavLink
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-900"
                        : "text-brand-500 hover:bg-brand-50 hover:text-brand-900"
                    }`
                  }
                >
                  <LayoutDashboard size={18} /> Panel Admin
                </NavLink>
              )}

              {userInfo && (
                <NavLink
                  to="/favoritos"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-900"
                        : "text-brand-500 hover:bg-brand-50 hover:text-brand-900"
                    }`
                  }
                >
                  <Heart size={18} /> Mis favoritos
                </NavLink>
              )}

              {userInfo && (
                <NavLink
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-900"
                        : "text-brand-500 hover:bg-brand-50 hover:text-brand-900"
                    }`
                  }
                >
                  <User size={18} /> Mi perfil
                </NavLink>
              )}
            </nav>

            <div className="mt-auto border-t border-brand-100 p-4">
              {userInfo ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {userInfo.name?.charAt(0).toUpperCase()}
                    </span>
                    <span className="leading-tight">
                      <span className="block text-sm font-semibold text-brand-900">
                        {userInfo.name}
                      </span>
                      <span className="block truncate text-xs text-brand-400">
                        {userInfo.email}
                      </span>
                    </span>
                  </div>

                  <button onClick={logoutHandler} className="btn-secondary w-full">
                    <LogOut size={16} /> Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-primary w-full">
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
