import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      await api.post("/users/register", {
        name,
        email,
        password,
      });

      alert("Usuario registrado correctamente");

      navigate("/login");
    } catch (error) {
      console.error(error);

      alert("Error al registrar, el usuario ya existe o hay un problema con el servidor");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6">
        Crear Cuenta
      </h1>

      <form
        onSubmit={submitHandler}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="Nombre"
          className="w-full border p-3 rounded-lg"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <input
          type="email"
          placeholder="Correo"
          className="w-full border p-3 rounded-lg"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border p-3 rounded-lg"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          className="w-full border p-3 rounded-lg"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
        />

        <button
          type="submit"
          className="w-full bg-[#4A6FA5] text-white py-3 rounded-lg"
        >
          Registrarse
        </button>
      </form>

      <p className="text-center mt-4">
        ¿Ya tienes cuenta?{" "}
        <Link
          to="/login"
          className="text-[#4A6FA5]"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}

export default Register;