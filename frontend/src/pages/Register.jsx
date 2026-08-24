import { useCallback, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../services/api";
import { AuthContext } from "../context/authContext";
import toast from "react-hot-toast";
import GoogleButton from "../components/GoogleButton";

function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleGoogleSuccess = useCallback(
    (data) => {
      login(data);
      toast.success(`¡Bienvenido, ${data.name}!`);
      navigate("/");
    },
    [login, navigate]
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    const normalizedEmail = email.trim();

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }

    if (!normalizedEmail) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      newErrors.email = "Ingresa un correo válido.";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      newErrors.password = "Debe tener al menos 6 caracteres.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
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
      await api.post("/users/register", {
        name: name.trim(),
        email: normalizedEmail,
        password,
      });

      toast.success("Usuario registrado correctamente");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar. El usuario ya existe o hay un problema con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="card animate-fade-in-up p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">
          Crear cuenta
        </h1>

        <p className="mt-2 text-sm text-brand-400">
          Únete y empieza a construir tu setup ideal.
        </p>

        <form onSubmit={submitHandler} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor="register-name" className="label-field">
              Nombre
            </label>

            <input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="Tu nombre"
              className={`input-field ${errors.name ? "!border-red-300 !ring-red-100" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {errors.name && (
              <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="register-email" className="label-field">
              Correo electrónico
            </label>

            <input
              id="register-email"
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
            <label htmlFor="register-password" className="label-field">
              Contraseña
            </label>

            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
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

          <div>
            <label htmlFor="register-confirm" className="label-field">
              Confirmar contraseña
            </label>

            <input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              className={`input-field ${errors.confirmPassword ? "!border-red-300 !ring-red-100" : ""}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5">
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" /> Registrando...
              </>
            ) : (
              "Crear cuenta"
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
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-semibold text-brand-800 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
