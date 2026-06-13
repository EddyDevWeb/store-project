import { useState } from "react";
import api from "../services/api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Login() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            const { data } = await api.post("/users/login", {
                email,
                password,
            });

            login(data);
            alert("Inicio de sesión exitoso");
        } catch (error) {
            console.error(error);
            alert("Credenciales incorrectas");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold text-center mb-6">
                Iniciar Sesión
            </h1>

            <form onSubmit={submitHandler}>
                <div className="mb-4">
                    <label className="block mb-2">Correo</label>

                    <input
                        type="email"
                        className="w-full border rounded-lg p-3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2">Contraseña</label>

                    <input
                        type="password"
                        className="w-full border rounded-lg p-3"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#4A6FA5] text-white py-3 rounded-lg hover:bg-[#3F5E8A]"
                >
                    Entrar
                </button>
                <p className="text-center mt-4">
                    ¿No tienes cuenta?{" "}
                    <Link
                        to="/register"
                        className="text-[#4A6FA5]"
                    >
                        Regístrate
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Login;