import { Link } from "react-router-dom";

const shopLinks = [
  { to: "/", label: "Inicio" },
  { to: "/products", label: "Productos" },
  { to: "/cart", label: "Carrito" },
  { to: "/profile", label: "Mi cuenta" },
];

const accountLinks = [
  { to: "/login", label: "Iniciar sesión" },
  { to: "/register", label: "Crear cuenta" },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-brand-950 text-brand-300">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-extrabold tracking-tight text-white">
              Tech<span className="font-light text-brand-400">Store</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Componentes, periféricos y accesorios seleccionados para
              ofrecer calidad, rendimiento y confiabilidad.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Tienda
            </h3>

            <ul className="space-y-2.5 text-sm">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Cuenta
            </h3>

            <ul className="space-y-2.5 text-sm">
              {accountLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:soporte@techstore.com"
                  className="transition-colors hover:text-white"
                >
                  Soporte
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-brand-800 pt-6 text-xs sm:flex-row">
          <p>© {year} TechStore. Todos los derechos reservados.</p>
          <p>Hecho con tecnología premium.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
