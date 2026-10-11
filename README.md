# TechStore

E-commerce full-stack de tecnología con pagos reales vía **Stripe Checkout**, panel de administración independiente, autenticación con **Google** y **JWT**, reseñas verificadas y control de stock en tiempo real.

> Proyecto con fines educativos y de portafolio. Los pagos operan en modo **test** de Stripe.

**Demo:** _pendiente de desplegar — sustituye este texto por las URLs de Vercel y Render._

## Características

**Tienda**
- Catálogo con búsqueda, orden por precio/novedad y badge de últimas unidades
- Detalle de producto con galería e información de stock
- Carrito persistente con sincronización automática de stock
- Pago con tarjeta mediante **Stripe Checkout** (envío gratis desde $50 y rollback de stock si falla el pago)
- Páginas de resultado de pago (exitoso / cancelado) con verificación server-side
- Historial de pedidos con timeline de estados y opción "volver a comprar"
- Favoritos y reseñas con estrellas (solo compradores verificados)
- Recuperación de contraseña por email con token de un solo uso

**Cuentas**
- Registro/login local con JWT + inicio de sesión con Google
- Interceptor de sesión: cierre automático al expirar el token

**Panel de administración** (`/admin`, layout propio independiente de la tienda)
- Dashboard con gráfica de ventas de los últimos 30 días (Recharts)
- CRUD completo de productos
- Gestión de órdenes con cambio de estado y badge de pago

**Seguridad**
- Helmet, rate limiting y CORS restrictivo en el backend (acepta dominios `*.vercel.app`)
- Contraseñas hasheadas con bcrypt
- Rutas protegidas por rol (`protect` / `admin`)
- Precios y stock resueltos siempre del lado del servidor
- Secretos gestionados por variables de entorno (nunca en el repositorio)

## Stack técnico

| Capa | Tecnologías |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, Recharts, lucide-react, react-hot-toast |
| Backend | Node.js, Express 5, Mongoose, JWT, bcryptjs, Stripe, Nodemailer, google-auth-library |
| Base de datos | MongoDB (Atlas en producción) |
| Seguridad | Helmet, express-rate-limit, CORS |
| Despliegue | Vercel (frontend), Render (backend), MongoDB Atlas |

## Estructura del proyecto

```
store-project/
├── backend/                     # API REST (Express + MongoDB)
│   ├── .env.example             # Plantilla de variables de entorno
│   └── src/
│       ├── server.js            # Entry point (CORS, /health, rutas)
│       ├── config/
│       │   ├── db.js            # Conexión a MongoDB
│       │   └── mailer.js        # Transporte de email (SMTP o Ethereal)
│       ├── models/              # User, Product, Order, Review
│       ├── controllers/         # Lógica de negocio (incluye pagos)
│       ├── routes/              # products, users, orders, reviews, payments
│       └── middleware/          # protect (JWT) + admin (rol)
├── frontend/                    # SPA (React + Vite)
│   ├── .env.example             # Plantilla de variables de entorno
│   ├── vercel.json              # Rewrites SPA para Vercel
│   └── src/
│       ├── pages/               # Tienda pública + pages/admin/
│       ├── components/          # Navbar, Footer, ProductCard, etc.
│       ├── context/             # AuthProvider, CartProvider, FavoritesProvider
│       └── services/api.js      # Cliente axios configurable por VITE_API_URL
├── render.yaml                  # Blueprint de despliegue del backend en Render
└── README.md
```

## Requisitos previos

- Node.js 18 o superior
- MongoDB corriendo en local **o** un cluster de [MongoDB Atlas](https://www.mongodb.com/atlas)
- Cuenta de [Stripe](https://dashboard.stripe.com/register) (modo test)
- Un Client ID de Google OAuth para el login social

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

Copia las plantillas y rellena tus valores:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**`backend/.env`**

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PORT` | No | Puerto del servidor API (por defecto `5000`; Render lo asigna). |
| `MONGO_URI` | Sí | Cadena de conexión a MongoDB (incluye el nombre de la base de datos). |
| `JWT_SECRET` | Sí | Secreto para firmar los tokens JWT (cadena larga y aleatoria). |
| `GOOGLE_CLIENT_ID` | Sí | Client ID de Google OAuth. |
| `CLIENT_URL` | Sí | URL del frontend para CORS y redirecciones de Stripe. Acepta lista separada por comas. |
| `STRIPE_SECRET_KEY` | Sí | Clave secreta de Stripe (debe empezar por `sk_test_`). |
| `SMTP_HOST` | No | Si se define, se envían correos reales. Si no, se usa Ethereal (prueba). |
| `SMTP_PORT` | No | Puerto SMTP (por defecto `587`; usa `465` para SSL). |
| `SMTP_USER` / `SMTP_PASS` | No | Credenciales SMTP. |
| `EMAIL_FROM` | No | Remitente de los correos (por defecto `"TechStore" <no-reply@techstore.dev>`). |

**`frontend/.env`**

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_API_URL` | Sí | URL base de la API incluyendo `/api` (ej. `https://tu-backend.onrender.com/api`). |
| `VITE_GOOGLE_CLIENT_ID` | Sí | Mismo Client ID de Google que el backend. |

> Nunca subas los archivos `.env` a Git — están excluidos en `.gitignore`.

## Ejecución en local

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

## Endpoints de la API

Base URL: `/api` (local: `http://localhost:5000/api`)

**Estado**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/health` | Público | Health check (Render). |
| GET | `/` | Público | Mensaje de la API. |

**Productos**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/products` | Público | Lista el catálogo. |
| GET | `/api/products/:id` | Público | Detalle de un producto. |
| POST | `/api/products` | Admin | Crear producto. |
| PUT | `/api/products/:id` | Admin | Actualizar producto. |
| DELETE | `/api/products/:id` | Admin | Eliminar producto. |

**Usuarios**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/users/register` | Público | Registro local. |
| POST | `/api/users/login` | Público | Login local (devuelve JWT). |
| POST | `/api/users/google` | Público | Login con Google. |
| POST | `/api/users/forgot-password` | Público | Envía email de recuperación. |
| POST | `/api/users/reset-password/:token` | Público | Restablece contraseña. |
| GET | `/api/users/profile` | Usuario | Perfil del usuario autenticado. |
| GET | `/api/users/favorites` | Usuario | Favoritos del usuario. |
| POST | `/api/users/favorites/:productId` | Usuario | Añade/quita un favorito. |

**Órdenes**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/orders/myorders` | Usuario | Pedidos propios. |
| GET | `/api/orders/:id` | Usuario | Detalle de un pedido propio. |
| GET | `/api/orders/has-purchased/:productId` | Usuario | Comprueba compra (para reseñar). |
| GET | `/api/orders` | Admin | Todas las órdenes. |
| GET | `/api/orders/stats` | Admin | Estadísticas de ventas. |
| PUT | `/api/orders/:id` | Admin | Cambiar estado de una orden. |

**Reseñas**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/reviews/:productId` | Público | Reseñas de un producto. |
| POST | `/api/reviews/:productId` | Usuario | Crear reseña (solo compradores). |
| DELETE | `/api/reviews/:id` | Usuario | Eliminar reseña propia. |

**Pagos**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/payments/checkout-session` | Usuario | Crea una sesión de Stripe Checkout. |
| GET | `/api/payments/verify/:sessionId` | Usuario | Verifica el estado del pago. |

## Roles de usuario

| Rol | Descripción | Acceso |
|---|---|---|
| `user` | Cliente registrado (por defecto). | Carrito, pedidos, favoritos, reseñas y pago. |
| `admin` | Administrador. | Todo lo anterior + `/admin` (productos, órdenes y estadísticas). |

Para crear un admin, registra un usuario y cambia su campo `role` a `"admin"` directamente en MongoDB:

```js
db.users.updateOne({ email: "tu@email.com" }, { $set: { role: "admin" } })
```

## Despliegue paso a paso

### 1) MongoDB Atlas (base de datos)

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) y un cluster gratuito (M0).
2. En **Database Access**, crea un usuario de base de datos con contraseña.
3. En **Network Access**, añade la IP `0.0.0.0/0` (permite conexiones desde Render).
4. En **Connect → Drivers**, copia la cadena de conexión y añade el nombre de la base de datos, por ejemplo:
   `mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/techstore?retryWrites=true&w=majority`
5. Guarda esta cadena: será tu `MONGO_URI` en Render.

### 2) Render (backend)

1. Entra en [Render](https://render.com), conecta tu cuenta de GitHub e importa el repositorio **store-project**.
2. Render detecta `render.yaml`. Si no, crea un **Web Service** manual con:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
3. Define las variables de entorno (Environment):
   - `MONGO_URI` → cadena de Atlas (paso 1)
   - `JWT_SECRET` → cadena larga y aleatoria
   - `GOOGLE_CLIENT_ID` → tu Client ID de Google
   - `CLIENT_URL` → URL de tu frontend en Vercel (la añades tras el paso 3)
   - `STRIPE_SECRET_KEY` → tu clave `sk_test_...`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` → opcionales, para correos reales
4. Despliega y copia la URL pública, por ejemplo `https://store-project-backend.onrender.com`.

> En el plan gratuito el servicio se "duerme" tras un rato sin tráfico; la primera petición puede tardar unos segundos.

### 3) Vercel (frontend)

1. Entra en [Vercel](https://vercel.com), importa el repositorio **store-project**.
2. Configura el proyecto:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Añade las variables de entorno:
   - `VITE_API_URL` → `https://store-project-backend.onrender.com/api` (con `/api` al final)
   - `VITE_GOOGLE_CLIENT_ID` → tu Client ID de Google
4. Despliega y copia la URL pública, por ejemplo `https://store-project.vercel.app`.

### 4) Enlazar servicios

1. Vuelve a **Render** y actualiza `CLIENT_URL` con tu URL de Vercel
   (`https://store-project.vercel.app`). Puedes añadir varias separadas por comas.
   Los dominios de preview `*.vercel.app` se aceptan automáticamente.
2. En [Google Cloud Console](https://console.cloud.google.com/apis/credentials), edita tu credencial OAuth y añade en **Authorized JavaScript origins**:
   `http://localhost:5173`, `https://store-project.vercel.app` (y tus dominios de preview si quieres).
3. ¡Listo! Abre la URL de Vercel y prueba el registro, el login con Google y un pago con tarjeta de test.

## Licencia

Proyecto con fines educativos. Siéntete libre de usarlo como base para tu portafolio.
