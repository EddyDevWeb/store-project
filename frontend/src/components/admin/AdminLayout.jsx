import { useContext, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  X,
} from "lucide-react";
import { AuthContext } from "../../context/authContext";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/productos", label: "Productos", icon: Package },
  { to: "/admin/ordenes", label: "Órdenes", icon: ClipboardList },
];

const sectionTitles = {
  "/admin": "Dashboard",
  "/admin/productos": "Gestión de productos",
  "/admin/ordenes": "Gestión de órdenes",
};

function AdminLayout() {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const logoutHandler = () => {
    logout();
    navigate("/login");
  };

  const sidebarContent = (
    <>
      <div className="px-6 py-6">
        <Link to="/admin" className="text-xl font-extrabold tracking-tight text-white">
          Tech<span className="font-light text-brand-400">Store</span>
        </Link>

        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-brand-500">
          Panel de administración
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Navegación admin">
        {adminLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-brand-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={18} strokeWidth={1.8} /> {label}
          </NavLink>
        ))}

        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-brand-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink size={18} strokeWidth={1.8} /> Ver tienda
        </Link>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
            {userInfo?.name?.charAt(0).toUpperCase()}
          </span>

          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold text-white">
              {userInfo?.name}
            </span>

            <span className="block text-xs text-brand-500">Administrador</span>
          </span>
        </div>

        <button
          onClick={logoutHandler}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} strokeWidth={1.8} /> Salir
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-brand-50/70">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-brand-950 lg:flex">
        {sidebarContent}
      </aside>

      {/* Drawer móvil */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm"
          />

          <aside className="animate-slide-in-right absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-brand-950 shadow-lift">
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar menú"
              className="absolute left-4 top-6 rounded-xl p-1.5 text-brand-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
            <h1 className="truncate text-lg font-bold text-brand-900">
              {sectionTitles[location.pathname] ?? "Panel"}
            </h1>

            <div className="flex items-center gap-2">
              <Link to="/" className="btn-secondary hidden !py-2 sm:inline-flex">
                <ExternalLink size={15} /> Ver tienda
              </Link>

              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menú"
                className="rounded-xl p-2.5 text-brand-700 transition-colors hover:bg-brand-50 lg:hidden"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
