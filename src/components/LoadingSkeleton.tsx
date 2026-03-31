import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const shimmer = {
  initial: { x: "-100%" },
  animate: { x: "100%" },
};

const SkeletonLine = ({ className }: { className?: string }) => (
  <div className={cn("relative overflow-hidden rounded-md bg-muted", className)}>
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent"
    />
  </div>
);

export const CardSkeleton = () => (
  <div className="rounded-xl border border-border p-4 space-y-3">
    <div className="flex items-center gap-3">
      <SkeletonLine className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-3 w-1/2" />
      </div>
    </div>
    <SkeletonLine className="h-3 w-full" />
    <SkeletonLine className="h-3 w-5/6" />
    <div className="flex gap-2 pt-2">
      <SkeletonLine className="h-8 w-20 rounded-full" />
      <SkeletonLine className="h-8 w-16 rounded-full" />
    </div>
  </div>
);

export const MetricsSkeleton = () => (
  <div className="rounded-xl border border-border p-4 space-y-2">
    <SkeletonLine className="h-3 w-1/2" />
    <SkeletonLine className="h-8 w-3/4" />
    <SkeletonLine className="h-3 w-1/3" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
    <div className="space-y-2">
      <SkeletonLine className="h-8 w-64" />
      <SkeletonLine className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <MetricsSkeleton key={i} />)}
    </div>
    <div className="grid md:grid-cols-2 gap-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

export const ProfileCardSkeleton = () => (
  <div className="rounded-xl border border-border p-5 space-y-4">
    <div className="flex items-center gap-4">
      <SkeletonLine className="h-16 w-16 rounded-full" />
      <div className="space-y-2 flex-1">
        <SkeletonLine className="h-5 w-2/3" />
        <SkeletonLine className="h-3 w-1/2" />
        <SkeletonLine className="h-3 w-1/3" />
      </div>
    </div>
    <SkeletonLine className="h-4 w-full" />
    <SkeletonLine className="h-4 w-4/5" />
    <div className="flex gap-2">
      <SkeletonLine className="h-9 flex-1 rounded-lg" />
      <SkeletonLine className="h-9 flex-1 rounded-lg" />
    </div>
  </div>
);
