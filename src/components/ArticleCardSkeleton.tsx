import { Skeleton } from "@/components/ui/skeleton";

export const ArticleCardSkeleton = () => (
  <div className="rounded-xl border border-outline-variant/30 bg-surface overflow-hidden shadow-sm">
    <Skeleton className="w-full h-48" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-20 mt-2" />
    </div>
  </div>
);

export const SidebarArticleSkeleton = () => (
  <div className="flex gap-3 items-start">
    <Skeleton className="w-20 h-16 rounded shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

export const ArchiveIssueSkeleton = () => (
  <div className="text-center">
    <Skeleton className="w-full aspect-[3/4] rounded-lg mb-3" />
    <Skeleton className="h-4 w-3/4 mx-auto" />
    <Skeleton className="h-3 w-1/2 mx-auto mt-2" />
  </div>
);