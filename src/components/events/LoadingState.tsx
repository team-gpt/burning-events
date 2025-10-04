import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface LoadingStateProps {
  count?: number;
  className?: string;
}

function EventCardSkeleton() {
  return (
    <Card className="border border-neutral-200">
      <CardHeader className="pb-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-12" />
            </div>
            
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-6 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          
          <div className="flex items-center gap-1 mt-3 flex-wrap">
            <Skeleton className="w-3 h-3" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadingState({ count = 4, className }: LoadingStateProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Date header skeleton */}
      <div className="flex items-center justify-between py-4 border-b border-neutral-200">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      {/* Event cards skeletons */}
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}