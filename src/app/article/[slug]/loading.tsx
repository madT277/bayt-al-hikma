import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function ArticleLoading() {
  return (
    <main className="py-12 md:py-16" dir="rtl" aria-busy="true" aria-label="جاري تحميل المقال">
      <div className="wrap-narrow space-y-5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-5/6" />
        <div className="flex items-center justify-between border-y border-border py-4">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
      <div className="wrap my-10">
        <Skeleton className="aspect-[16/9] max-h-[540px] w-full" />
      </div>
      <div className="wrap-narrow space-y-6">
        <SkeletonText lines={4} />
        <SkeletonText lines={4} />
        <SkeletonText lines={3} />
      </div>
    </main>
  );
}
