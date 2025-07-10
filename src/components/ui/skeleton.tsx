import { cn } from "@/lib/utils"

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "shimmer" | "card"
}) {
  const variants = {
    default: "animate-pulse bg-muted",
    shimmer: "shimmer bg-muted relative overflow-hidden",
    card: "shimmer bg-gradient-to-r from-muted via-muted-foreground/5 to-muted"
  }

  return (
    <div
      className={cn("rounded-md", variants[variant], className)}
      {...props}
    />
  )
}

// Skeleton components for specific use cases
function SkeletonCard() {
  return (
    <div className="space-y-4 p-6 bg-card rounded-xl shadow-card">
      <div className="flex items-center space-x-4">
        <Skeleton variant="shimmer" className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="shimmer" className="h-4 w-3/4" />
          <Skeleton variant="shimmer" className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="shimmer" className="h-3 w-full" />
        <Skeleton variant="shimmer" className="h-3 w-4/5" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="shimmer" className="h-6 w-16 rounded-full" />
        <Skeleton variant="shimmer" className="h-6 w-20 rounded-full" />
        <Skeleton variant="shimmer" className="h-6 w-14 rounded-full" />
      </div>
    </div>
  )
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonGrid }
