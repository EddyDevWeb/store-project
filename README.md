# TechStore

E-commerce full-stack de tecnología con pagos reales vía Stripe Checkout, panel de administración independiente, autenticación con Google y JWT, reseñas verificadas y control de stock en tiempo real.

> Proyecto de prueba con fines educativos. Los pagos operan en modo **test** de Stripe.

## Características

**Tienda**
- Catálogo con búsqueda, orden por precio/novedad y badge de últimas unidades
- Detalle de producto con galería e información de stock
- Carrito persistente con sincronización de stock automática
- Pago con tarjeta mediante **Stripe Checkout** (envío gratis desde $50, rollback de stock si falla el pago)
- Páginas de resultado de pago (exitoso / cancelado) con verificación server-side
- Historial de pedidos con timeline de estados y opción "volver a comprar"
- Favoritos y reseñas con estrellas (solo compradores verificados)
- Recuperación de contraseña por email con token de un solo uso

**Cuentas**
- Registro/login local con JWT + inicio de sesión con Google
- Interceptores de sesión: cierre automático al expirar el token

**Panel de administración** (`/admin`, layout propio independiente de la tienda)
- Dashboard con gráfica de ventas de los últimos 30 días (Recharts)
- CRUD completo de productos
- Gestión de órdenes con cambio de estado (Pendiente → Procesando → Enviado → Entregado) y badge de pago

**Seguridad**
- Helmet, rate limiting y CORS restrictivo en el backend
- Contraseñas hasheadas con bcrypt
- Rutas protegidas por rol (`protect` / `admin`)
- Precios y stock resueltos siempre del lado del servidor

## Stack técnico

| Capa | Tecnologías |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, Recharts, lucide-react, react-hot-toast |
| Backend | Node.js, Express 5, Mongoose, JWT, bcryptjs, Stripe, Nodemailer, google-auth-library |
| Base de datos | MongoDB |
| Seguridad | Helmet, express-rate-limit, CORS |

## Estructura del proyecto

```
store-project/
├── backend/          # API REST (Express + MongoDB)
│   └── src/
│       ├── server.js           # Entry point
│       ├── config/db.js        # Conexión a MongoDB
│       ├── models/             # User, Product, Order, Review
│       ├── controllers/        # Lógica de negocio (incluye pagos)
│       ├── routes/             # products, users, orders, reviews, payments
│       └── middleware/         # protect (JWT) + admin (rol)
└── frontend/         # SPA (React + Vite)
    └── src/
        ├── pages/              # Tienda pública + pages/admin/
        ├── components/         # Navbar, Footer, ProductCard, etc.
        ├── context/            # AuthProvider, CartProvider
        └── services/api.js     # Cliente axios con interceptores
```

## Requisitos previos

- Node.js 18+
- MongoDB corriendo localmente o un cluster de [MongoDB Atlas](https://www.mongodb.com/atlas)
- Cuenta de [Stripe](https://dashboard.stripe.com/register) (modo test)

## Instalación

```bash
# Clonar
git clone https://github.com/DOMI623/store-project.git
cd store-project

# 1. Backend
cd backend
npm install

# 2. Frontend
cd ../frontend
npm install
```

### Configurar variables de entorno

**`backend/.env`**

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/techstore
JWT_SECRET=tu_secreto_jwt_super_seguro
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_tu_clave_de_prueba
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor API (por defecto 5000) |
| `MONGO_URI` | Cadena de conexión a MongoDB |
| `JWT_SECRET` | Secreto para firmar los tokens JWT |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth (login social) |
| `CLIENT_URL` | URL del frontend para redirecciones de Stripe |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (**debe empezar por `sk_test_`**) |

**`frontend/.env`**

```env
VITE_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
```

> El frontend espera la API en `http://localhost:5000/api` (configurable en `src/services/api.js`).

⚠️ Nunca subas los archivos `.env` a Git — ya están excluidos en `.gitignore`.

## Ejecución

```bash
# Terminal 1 — API en http://localhost:5000
cd backend
npm run dev

# Terminal 2 — App en http://localhost:5173
cd frontend
npm run dev
```

### Tarjetas de prueba de Stripe

| Escenario | Número |
|---|---|
| Pago exitoso | `4242 4242 4242 4242` |
| Pago rechazado | `4000 0000 0000 9995` |

Fecha futura cualquiera, CVC de 3 dígitos y ZIP cualquiera.

## Scripts disponibles

| Comando | Dónde | Acción |
|---|---|---|
| `npm run dev` | backend / frontend | Servidor de desarrollo (nodemon / Vite HMR) |
| `npm start` | backend | Servidor en producción |
| `npm run build` | frontend | Build de producción en `dist/` |
| `npm run lint` | frontend | ESLint |
| `npm run preview` | frontend | Sirve el build localmente |

## Endpoints principales de la API

Base URL: `http://localhost:5000/api`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/products` · `/products/:id` | Público | Catálogo / detalle |
| POST/PUT/DELETE | `/products[/:id]` | Admin | CRUD de productos |
| POST | `/users/register` · `/users/login` · `/users/google` | Público | Autenticación |
| GET | `/orders/myorders` · `/orders/:id` | Usuario | Pedidos propios |
| GET | `/orders` · PUT `/orders/:id` | Admin | Gestión de órdenes |
| POST | `/payments/checkout-session` | Usuario | Crear sesión de pago Stripe |
| GET | `/payments/verify/:sessionId` | Usuario | Verificar estado del pago |
| POST | `/orders/has-purchased/:productId` | Usuario | Verifica compra (para reseñar) |
