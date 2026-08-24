import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "../context/authContext";
import { useContext } from "react";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post(
        `/users/reset-password/${token}`,
        {
          password,
        }
      );

      login(data);

      toast.success(
        `Contraseña actualizada. ¡Bienvenido de nuevo, ${data.name}!`
      );

      navigate(data.role === "admin" ? "/admin" : "/");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ??
          "No se pudo restablecer la contraseña"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <div className="card animate-fade-in-up p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <KeyRound size={26} />
        </span>

        <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-brand-900">
          Nueva contraseña
        </h1>

        <p className="mt-2 text-center text-sm leading-relaxed text-brand-500">
          Crea una nueva contraseña para tu cuenta. Debe tener al
          menos 6 caracteres.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="password"
              className="label-field mb-1.5 block"
            >
              Nueva contraseña
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="••••••••"
                className="input-field w-full !pr-11"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 transition-colors hover:text-brand-800"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="label-field mb-1.5 block"
            >
              Confirmar contraseña
            </label>

            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="••••••••"
              className="input-field w-full"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full !py-3.5"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />{" "}
                Guardando...
              </>
            ) : (
              "Guardar contraseña"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-400">
          ¿El enlace expiró?{" "}
          <Link
            to="/olvide-contrasena"
            className="font-semibold text-brand-600 transition-colors hover:text-brand-800"
          >
            Solicita uno nuevo
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
