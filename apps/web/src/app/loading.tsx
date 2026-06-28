import { Skeleton, SkeletonRect, SkeletonText } from "@nexus/ui";
import { Container } from "@nexus/ui";

export default function Loading() {
  return (
    <main id="main-content" className="flex-1">
      <Container size="xl" className="py-8">
        <div className="flex flex-col gap-6">
          {/* Hero skeleton */}
          <SkeletonRect aspectRatio="21/9" className="rounded-[var(--radius-5)]" />
          {/* Section heading skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48 rounded-[var(--radius-2)]" />
            <Skeleton className="h-4 w-20 rounded-[var(--radius-2)]" />
          </div>
          {/* Card row skeleton */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <SkeletonRect aspectRatio="2/3" className="rounded-[var(--radius-4)]" />
                <Skeleton className="h-4 w-3/4 rounded-[var(--radius-1)]" />
                <Skeleton className="h-3 w-1/2 rounded-[var(--radius-1)]" />
              </div>
            ))}
          </div>
          {/* Second section */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40 rounded-[var(--radius-2)]" />
            <Skeleton className="h-4 w-20 rounded-[var(--radius-2)]" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <SkeletonRect aspectRatio="2/3" className="rounded-[var(--radius-4)]" />
                <Skeleton className="h-4 w-3/4 rounded-[var(--radius-1)]" />
                <Skeleton className="h-3 w-1/2 rounded-[var(--radius-1)]" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
