import { SearchX } from "lucide-react";

function EmptyState({
  icon: Icon = SearchX,
  title = "No hay resultados",
  description = "",
  action = null,
}) {
  return (
    <div className="card animate-fade-in-up flex flex-col items-center px-8 py-16 text-center">
      {Icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-300">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      )}

      <h3 className="text-xl font-semibold text-brand-800">{title}</h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-brand-500">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
