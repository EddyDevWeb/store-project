import { useState, useEffect } from "react";
import api from "../services/api";

function AdminDashboard() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState("");
    const [category, setCategory] = useState("");
    const [stock, setStock] = useState("");
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const totalProducts = products.length;

    const totalStock = products.reduce(
        (acc, product) => acc + product.stock,
        0
    );

    const filteredProducts = products.filter((product) =>
        product.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            if (editingProduct) {
                await api.put(
                    `/products/${editingProduct._id}`,
                    {
                        title,
                        description,
                        price,
                        image,
                        category,
                        stock,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                alert("Producto actualizado");
            } else {
                await api.post(
                    "/products",
                    {
                        title,
                        description,
                        price,
                        image,
                        category,
                        stock,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                alert("Producto creado");
            }

            setEditingProduct(null);

            setTitle("");
            setDescription("");
            setPrice("");
            setImage("");
            setCategory("");
            setStock("");

            fetchProducts();
        } catch (error) {
            console.error(error);
            alert(
                editingProduct
                    ? "Error al actualizar producto"
                    : "Error al crear producto"
            );
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await api.get("/products");

            setProducts(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const deleteProduct = async (id) => {
        const confirmDelete = window.confirm(
            "¿Estás seguro de que deseas eliminar este producto?"
        );

        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");

            await api.delete(`/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const editProduct = (product) => {
        setEditingProduct(product);

        setTitle(product.title);
        setDescription(product.description);
        setPrice(product.price);
        setImage(product.image);
        setCategory(product.category);
        setStock(product.stock);
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow">
            <h1 className="text-3xl font-bold mb-6">
                Panel de Administración
            </h1>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border p-3 rounded-lg"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-gray-500">
                        Total Productos
                    </h3>

                    <p className="text-3xl font-bold">
                        {totalProducts}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-gray-500">
                        Stock Total
                    </h3>

                    <p className="text-3xl font-bold">
                        {totalStock}
                    </p>
                </div>
            </div>

            <form onSubmit={submitHandler} className="space-y-4">
                <input
                    type="text"
                    placeholder="Título"
                    className="w-full border p-3 rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Descripción"
                    className="w-full border p-3 rounded"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Precio"
                    className="w-full border p-3 rounded"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="URL de Imagen"
                    className="w-full border p-3 rounded"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Categoría"
                    className="w-full border p-3 rounded"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Stock"
                    className="w-full border p-3 rounded"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                />

                <button
                    type="submit"
                    className="w-full bg-[#4A6FA5] text-white py-3 rounded-lg"
                >
                    Crear Producto
                </button>
            </form>

            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">
                    Productos Registrados
                </h2>

                <div className="mt-8 overflow-x-auto">
                    <table className="w-full bg-white rounded-xl shadow overflow-hidden">
                        <thead>
                            <tr className="bg-[#4A6FA5] text-white">
                                <th className="p-4 text-left">Imagen</th>
                                <th className="p-4 text-left">Producto</th>
                                <th className="p-4 text-left">Categoría</th>
                                <th className="p-4 text-left">Precio</th>
                                <th className="p-4 text-left">Stock</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr
                                    key={product._id}
                                    className="border-b hover:bg-gray-50"
                                >
                                    <td className="p-4">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                    </td>
                                    <td className="p-4 font-medium">
                                        {product.title}
                                    </td>

                                    <td className="p-4">
                                        {product.category}
                                    </td>

                                    <td className="p-4">
                                        ${product.price}
                                    </td>

                                    <td className="p-4">
                                        {product.stock}
                                    </td>

                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() =>
                                                    editProduct(product)
                                                }
                                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                onClick={() =>
                                                    deleteProduct(product._id)
                                                }
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;