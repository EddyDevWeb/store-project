import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ImageOff,
  Loader2,
  PackageSearch,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import EmptyState from "../../components/EmptyState";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  image: "",
  category: "",
  stock: "",
};

function AdminProducts() {
  const [form, setForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data } = await api.get("/products");

        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const refreshProducts = async () => {
    try {
      const { data } = await api.get("/products");

      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.price || !form.category.trim()) {
      toast.error("Completa título, precio y categoría");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success("Producto actualizado");
      } else {
        await api.post("/products", payload);
        toast.success("Producto creado");
      }

      resetForm();
      refreshProducts();
    } catch (error) {
      console.error(error);
      toast.error(
        editingProduct
          ? "Error al actualizar el producto"
          : "Error al crear el producto"
      );
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);

    setForm({
      title: product.title,
      description: product.description ?? "",
      price: product.price,
      image: product.image ?? "",
      category: product.category,
      stock: product.stock,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setDeleting(true);

    try {
      await api.delete(`/products/${productToDelete._id}`);

      toast.success(`"${productToDelete.title}" eliminado`);

      setProductToDelete(null);
      refreshProducts();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el producto");
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in-up space-y-8">
      {/* Formulario */}
      <section className="card p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-brand-900">
            {editingProduct ? (
              <>
                <Pencil size={18} className="text-brand-400" /> Editando:{" "}
                <span className="truncate font-semibold text-brand-500">
                  {editingProduct.title}
                </span>
              </>
            ) : (
              <>
                <Plus size={18} className="text-brand-400" /> Nuevo producto
              </>
            )}
          </h2>

          {editingProduct && (
            <button onClick={resetForm} className="btn-secondary !py-2 !text-xs">
              <X size={14} /> Cancelar edición
            </button>
          )}
        </div>

        <form onSubmit={submitHandler} className="mt-6 grid gap-5 md:grid-cols-2">
          {/* Preview de imagen */}
          <div className="md:row-span-3">
            <label htmlFor="admin-img" className="label-field">
              URL de imagen
            </label>

            <input
              id="admin-img"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              className="input-field"
              value={form.image}
              onChange={handleChange("image")}
            />

            <div className="mt-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-dashed border-brand-200 bg-brand-50">
              {form.image ? (
                <img
                  src={form.image}
                  alt="Vista previa"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex flex-col items-center gap-2 text-brand-300">
                  <ImageOff size={28} strokeWidth={1.5} />
                  <span className="text-xs">Vista previa de imagen</span>
                </span>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="admin-title" className="label-field">
              Título *
            </label>

            <input
              id="admin-title"
              type="text"
              placeholder="Nombre del producto"
              className="input-field"
              value={form.title}
              onChange={handleChange("title")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 md:col-span-1">
            <div>
              <label htmlFor="admin-price" className="label-field">
                Precio ($) *
              </label>

              <input
                id="admin-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="99.99"
                className="input-field"
                value={form.price}
                onChange={handleChange("price")}
                required
              />
            </div>

            <div>
              <label htmlFor="admin-stock" className="label-field">
                Stock
              </label>

              <input
                id="admin-stock"
                type="number"
                min="0"
                placeholder="10"
                className="input-field"
                value={form.stock}
                onChange={handleChange("stock")}
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-category" className="label-field">
              Categoría *
            </label>

            <input
              id="admin-category"
              type="text"
              placeholder="Laptops, Gaming, Monitores..."
              className="input-field"
              value={form.category}
              onChange={handleChange("category")}
              list="categorias-sugeridas"
              required
            />

            <datalist id="categorias-sugeridas">
              <option value="Laptops" />
              <option value="Gaming" />
              <option value="Monitores" />
              <option value="Componentes" />
            </datalist>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="admin-description" className="label-field">
              Descripción
            </label>

            <textarea
              id="admin-description"
              rows="4"
              placeholder="Describe las características del producto..."
              className="input-field resize-none"
              value={form.description}
              onChange={handleChange("description")}
            />
          </div>

          <div className="md:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto sm:!px-10">
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" /> Guardando...
                </>
              ) : editingProduct ? (
                <>
                  <Save size={16} /> Guardar cambios
                </>
              ) : (
                <>
                  <Plus size={16} /> Crear producto
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Tabla de productos */}
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-brand-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-bold text-brand-900">
            Productos{" "}
            <span className="ml-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-500">
              {filteredProducts.length}
            </span>
          </h2>

          <div className="relative sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400"
            />

            <input
              type="text"
              placeholder="Buscar producto..."
              aria-label="Buscar productos en el panel"
              className="input-field !py-2.5 !pl-10"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-brand-100 bg-brand-50/60 text-left text-xs uppercase tracking-wider text-brand-400">
                <th className="px-6 py-4 font-semibold">Producto</th>
                <th className="px-6 py-4 font-semibold">Categoría</th>
                <th className="px-6 py-4 font-semibold">Precio</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 text-right font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-brand-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan="5" className="px-6 py-4">
                      <div className="h-10 animate-pulse rounded-lg bg-brand-50" />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6">
                    <EmptyState
                      icon={PackageSearch}
                      title="Sin resultados"
                      description={`No hay productos que coincidan con "${searchTerm}".`}
                    />
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="transition-colors hover:bg-brand-50/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={product.image}
                          alt={product.title}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                          className="h-11 w-11 shrink-0 rounded-lg bg-brand-50 object-cover"
                        />

                        <span className="line-clamp-1 max-w-[260px] font-medium text-brand-900">
                          {product.title}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-brand-500">{product.category}</td>

                    <td className="px-6 py-4 font-bold text-accent-500">
                      ${Number(product.price).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          product.stock === 0
                            ? "bg-red-50 text-red-600"
                            : product.stock <= 5
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {product.stock} uds.
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => editProduct(product)}
                          aria-label={`Editar ${product.title}`}
                          className="rounded-lg border border-brand-200 p-2 text-brand-600 transition-colors hover:bg-brand-800 hover:text-white"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => setProductToDelete(product)}
                          aria-label={`Eliminar ${product.title}`}
                          className="rounded-lg border border-brand-200 p-2 text-red-500 transition-colors hover:border-red-200 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de confirmación */}
      {productToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            aria-label="Cerrar diálogo"
            onClick={() => setProductToDelete(null)}
            className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm"
          />

          <div className="animate-scale-in card relative w-full max-w-md p-7 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle size={26} strokeWidth={1.8} />
            </span>

            <h3 className="text-lg font-bold text-brand-900">¿Eliminar producto?</h3>

            <p className="mt-2 text-sm leading-relaxed text-brand-500">
              Estás a punto de eliminar{" "}
              <strong className="text-brand-800">"{productToDelete.title}"</strong>.
              Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="btn-secondary w-full"
                disabled={deleting}
              >
                Cancelar
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} /> Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
