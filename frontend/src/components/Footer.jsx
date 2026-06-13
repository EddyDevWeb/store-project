function Footer() {
  return (
    <footer className="bg-[#2D3748] text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid md:grid-cols-3 gap-10">

          <div>
            <h2 className="text-3xl font-bold">
              TechStore
            </h2>

            <p className="text-gray-300 mt-4">
              Componentes, periféricos y accesorios
              seleccionados para ofrecer calidad,
              rendimiento y confiabilidad.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">
              Navegación
            </h3>

            <ul className="space-y-2 text-gray-300">
              <li>Inicio</li>
              <li>Productos</li>
              <li>Login</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">
              Información
            </h3>

            <ul className="space-y-2 text-gray-300">
              <li>Soporte</li>
              <li>Contacto</li>
              <li>Política de Privacidad</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400">
          © 2026 TechStore. Todos los derechos reservados.
        </div>

      </div>
    </footer>
  );
}

export default Footer;