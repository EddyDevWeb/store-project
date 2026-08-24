import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, MailCheck, MailWarning } from "lucide-react";
import api from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data } = await api.post("/users/forgot-password", {
        email,
      });

      setPreviewUrl(data.previewUrl ?? null);
      setSent(true);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ??
          "No se pudo procesar la solicitud"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <div className="card animate-fade-in-up p-8">
        {!sent ? (
          <>
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">
              Recuperar contraseña
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-brand-500">
              Escribe el email con el que te registraste y te
              enviaremos un enlace para crear una nueva contraseña.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="label-field mb-1.5 block"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@email.com"
                  className="input-field w-full"
                />
              </div>

              {error && (
                <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  <MailWarning size={16} className="shrink-0" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full !py-3.5"
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />{" "}
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="animate-scale-in text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <MailCheck size={26} />
            </span>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brand-900">
              Revisa tu email
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-brand-500">
              Si ese email está registrado, te enviamos un enlace
              para restablecer tu contraseña. Tienes 1 hora para
              usarlo.
            </p>

            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary mt-6 w-full"
              >
                Ver el email enviado (modo prueba)
              </a>
            )}
          </div>
        )}

        <p className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-800"
          >
            <ArrowLeft size={15} /> Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
