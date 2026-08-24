import { Star } from "lucide-react";

function Stars({ value = 0, size = 14, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${value} de 5 estrellas`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < Math.round(value);

        return (
          <Star
            key={index}
            size={size}
            className={
              filled
                ? "fill-amber-400 text-amber-400"
                : "text-brand-200"
            }
          />
        );
      })}
    </span>
  );
}

export default Stars;
