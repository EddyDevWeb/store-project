import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import AuthProvider from "./context/AuthProvider";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/CartProvider";
import FavoritesProvider from "./context/FavoritesProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <App />
          <Toaster position="top-right" />
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);