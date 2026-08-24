import { useCallback, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../services/api";
import { AuthContext } from "../context/authContext";
import toast from "react-hot-toast";
import GoogleButton from "../components/GoogleButton";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoogleSuccess = useCallback(
    (data) => {
      login(data);
      toast.success("Inicio de sesión exitoso");
      navigate(data.role === "admin" ? "/admin" : "/");
    },
    [login, navigate]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      newErrors.email = "Ingresa un correo válido.";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria.";
    }

    return { errors: newErrors, normalizedEmail };
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const { errors: validationErrors, normalizedEmail } = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    try {
      const { data } = await api.post("/users/login", {
        email: normalizedEmail,
        password,
      });

      login(data);
      toast.success("Inicio de sesión exitoso");
      navigate(data.role === "admin" ? "/admin" : "/");
    } catch (error) {
      console.error(error);
      toast.error("Credenciales incorrectas");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="card animate-fade-in-up p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">
          Iniciar sesión
        </h1>

        <p className="mt-2 text-sm text-brand-400">
          Accede a tu cuenta para continuar comprando.
        </p>

        <form onSubmit={submitHandler} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor="login-email" className="label-field">
              Correo electrónico
            </label>

            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              className={`input-field ${errors.email ? "!border-red-300 !ring-red-100" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {errors.email && (
              <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className="label-field">
              Contraseña
            </label>

            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={`input-field ${errors.password ? "!border-red-300 !ring-red-100" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {errors.password && (
              <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5">
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" /> Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-brand-100" />
          <span className="text-xs font-medium text-brand-400">
            o continúa con
          </span>
          <span className="h-px flex-1 bg-brand-100" />
        </div>

        <GoogleButton onSuccess={handleGoogleSuccess} />

        <p className="mt-6 text-center text-sm text-brand-400">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="font-semibold text-brand-800 hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
