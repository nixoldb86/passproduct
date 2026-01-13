"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "bg-surface-2 rounded-[8px] animate-pulse",
        className
      )}
    />
  );
};

// Pre-built skeleton components
const SkeletonCard = () => (
  <div className="bg-surface-1 border border-border rounded-[16px] p-4 space-y-4">
    <Skeleton className="h-40 w-full rounded-[12px]" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-5 w-24 rounded-full" />
    </div>
    <Skeleton className="h-6 w-24" />
  </div>
);

const SkeletonProductDetail = () => (
  <div className="space-y-6">
    <Skeleton className="h-64 w-full rounded-[16px]" />
    <div className="space-y-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-6 w-28 rounded-full" />
      <Skeleton className="h-6 w-32 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <Skeleton className="h-12 w-full rounded-[12px]" />
  </div>
);

const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        <Skeleton className="h-16 w-16 rounded-[12px] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

export { Skeleton, SkeletonCard, SkeletonProductDetail, SkeletonList };
