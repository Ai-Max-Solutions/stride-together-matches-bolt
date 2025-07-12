import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 animate-shimmer bg-[linear-gradient(110deg,#f5f5f5,#ebebeb_40%,#f5f5f5_60%)] bg-[length:200%_100%]" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-shimmer bg-[linear-gradient(110deg,#f5f5f5,#ebebeb_40%,#f5f5f5_60%)] bg-[length:200%_100%]" />
            <div className="h-3 w-3/4 bg-gray-200 rounded animate-shimmer bg-[linear-gradient(110deg,#f5f5f5,#ebebeb_40%,#f5f5f5_60%)] bg-[length:200%_100%]" />
          </div>
          <div className="h-5 w-20 bg-gray-200 rounded-full animate-shimmer bg-[linear-gradient(110deg,#f5f5f5,#ebebeb_40%,#f5f5f5_60%)] bg-[length:200%_100%]" />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-200 rounded animate-shimmer bg-[linear-gradient(110deg,#f5f5f5,#ebebeb_40%,#f5f5f5_60%)] bg-[length:200%_100%]" />
          <div className="h-3 w-4/5 bg-gray-200 rounded animate-shimmer bg-[linear-gradient(110deg,#f5f5f5,#ebebeb_40%,#f5f5f5_60%)] bg-[length:200%_100%]" />
          
          <div className="flex gap-2 mt-3">
            <div className="h-6 w-16 bg-gray-200 rounded animate-shimmer bg-[linear-gradient(110deg,#f5f5f5,#ebebeb_40%,#f5f5f5_60%)] bg-[length:200%_100%]" />
            <div className="h-6 w-20 bg-gray-200 rounded animate-shimmer bg-[linear-gradient(110deg,#f5f5f5,#ebebeb_40%,#f5f5f5_60%)] bg-[length:200%_100%]" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between items-center">
          <div className="h-3 w-24 bg-gray-200 rounded animate-shimmer bg-[linear-gradient(110deg,#f5f5f5,#ebebeb_40%,#f5f5f5_60%)] bg-[length:200%_100%]" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded animate-shimmer bg-[linear-gradient(110deg,#f5f5f5,#ebebeb_40%,#f5f5f5_60%)] bg-[length:200%_100%]" />
            <div className="h-8 w-20 bg-gray-200 rounded animate-shimmer bg-[linear-gradient(110deg,#f5f5f5,#ebebeb_40%,#f5f5f5_60%)] bg-[length:200%_100%]" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
