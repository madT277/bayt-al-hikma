import { Skeleton } from "@/components/ui/skeleton";

export function ArticleCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[16/10] w-full" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
