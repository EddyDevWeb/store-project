function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-brand-100 ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-60 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:grid-cols-2">
      <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
      <div className="space-y-5 py-2">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-7 w-36 rounded-full" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <Skeleton className="h-13 w-56 rounded-xl" />
      </div>
    </div>
  );
}

export default Skeleton;
