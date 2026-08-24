import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { CartContext } from "./cartContext";

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem("cartItems");

        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem(
            "cartItems",
            JSON.stringify(cartItems)
        );
    }, [cartItems]);

    useEffect(() => {
        const syncStock = async () => {
            try {
                const { data } = await api.get("/products");

                setCartItems((prev) =>
                    prev
                        .map((item) => {
                            const fresh = data.find(
                                (product) =>
                                    String(product._id) === String(item._id)
                            );

                            if (!fresh) return null;

                            return {
                                ...item,
                                stock: fresh.stock,
                                qty: Math.min(item.qty, fresh.stock),
                            };
                        })
                        .filter((item) => item && item.qty > 0)
                );
            } catch (error) {
                console.error(error);
            }
        };

        syncStock();
    }, []);

    const addToCart = (product) => {
        const exist = cartItems.find(
            (item) => item._id === product._id
        );

        if (exist) {
            if (exist.qty >= product.stock) {
                toast.error(
                    `Solo hay ${product.stock} unidad(es) disponible(s)`
                );
                return;
            }

            setCartItems(
                cartItems.map((item) =>
                    item._id === product._id
                        ? {
                            ...item,
                            qty: item.qty + 1,
                        }
                        : item
                )
            );
            toast.success("Producto agregado al carrito");
        } else {
            if (product.stock <= 0) {
                toast.error("Producto sin stock");
                return;
            }

            setCartItems([
                ...cartItems,
                {
                    ...product,
                    qty: 1,
                },
            ]);
            toast.success("Producto agregado al carrito");
        }
    };

    const increaseQty = (id) => {
        setCartItems(
            cartItems.map((item) =>
                item._id === id &&
                item.qty < (item.stock ?? Number.MAX_SAFE_INTEGER)
                    ? { ...item, qty: item.qty + 1 }
                    : item
            )
        );
    };

    const decreaseQty = (id) => {
        setCartItems(
            cartItems
                .map((item) =>
                    item._id === id
                        ? { ...item, qty: item.qty - 1 }
                        : item
                )
                .filter((item) => item.qty > 0)
        );
    };

    const reorderItems = (items) => {
        const next = [...cartItems];
        let addedCount = 0;
        const skipped = [];

        for (const item of items) {
            const stock = item.stock ?? 0;

            if (stock <= 0) {
                skipped.push(item.title);
                continue;
            }

            const existing = next.find(
                (cartItem) =>
                    String(cartItem._id) === String(item._id)
            );
            const alreadyInCart = existing ? existing.qty : 0;
            const canAdd = Math.min(
                stock - alreadyInCart,
                item.qty
            );

            if (canAdd <= 0) {
                skipped.push(item.title);
                continue;
            }

            addedCount += canAdd;

            if (existing) {
                existing.qty += canAdd;
            } else {
                next.push({
                    _id: item._id,
                    title: item.title,
                    image: item.image,
                    price: item.price,
                    stock: item.stock,
                    qty: canAdd,
                });
            }
        }

        setCartItems(next);

        return { addedCount, skipped };
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const removeFromCart = (id) => {
        setCartItems(
            cartItems.filter(
                (item) => item._id !== id
            )
        );
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                increaseQty,
                decreaseQty,
                reorderItems,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}
