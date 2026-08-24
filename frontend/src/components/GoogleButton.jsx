import { useCallback, useEffect, useRef } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

let googleInitialized = false;

function GoogleButton({ onSuccess }) {
  const divRef = useRef(null);

  const handleCredential = useCallback(
    async (response) => {
      try {
        const { data } = await api.post("/users/google", {
          credential: response.credential,
        });

        onSuccess(data);
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message ??
            "No se pudo iniciar sesión con Google"
        );
      }
    },
    [onSuccess]
  );

  const handlerRef = useRef(handleCredential);

  useEffect(() => {
    handlerRef.current = handleCredential;
  }, [handleCredential]);

  useEffect(() => {
    let intervalId;

    const initGoogle = () => {
      if (!googleInitialized && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (response) => handlerRef.current(response),
        });

        googleInitialized = true;
      }

      if (!window.google?.accounts?.id || !divRef.current) return;

      divRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(divRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        locale: "es",
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      intervalId = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(intervalId);
          initGoogle();
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return <div ref={divRef} className="flex justify-center" />;
}

export default GoogleButton;
