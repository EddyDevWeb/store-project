import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import AuthProvider from "./context/AuthProvider";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/CartProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
    <CartProvider>
    <App />
      <Toaster position="top-right" />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);