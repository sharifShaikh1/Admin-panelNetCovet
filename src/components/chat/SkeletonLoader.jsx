import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SkeletonLoader = () => {
    return (
        <div className="space-y-3 p-2">
            {[...Array(5)].map((_, i) => (
                <div className="flex items-center space-x-4" key={i}>
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonLoader;