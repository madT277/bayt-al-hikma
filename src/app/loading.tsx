import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="section bg-background" dir="rtl" aria-busy="true" aria-label="جاري التحميل">
      <div className="wrap space-y-16">
        {/* Hero skeleton */}
        <div className="grid grid-cols-1 items-center gap-10 border-b border-border pb-16 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-12 w-4/5" />
            <SkeletonText lines={3} />
            <Skeleton className="h-11 w-36" />
          </div>
          <div className="lg:col-span-7">
            <Skeleton className="aspect-[16/10] w-full" />
          </div>
        </div>

        {/* Articles skeleton */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <Skeleton className="aspect-[16/10] w-full" />
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <SkeletonText lines={2} />
          </div>
          <div className="space-y-6 lg:col-span-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4 border-b border-border pb-6 last:border-b-0">
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-20 w-24 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
