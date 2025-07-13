import { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Generic lazy loading wrapper with loading fallback
export function createLazyComponent<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Specialized lazy loaders for common component types
export function createLazyModal<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>
) {
  return createLazyComponent(
    importFn,
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner />
    </div>
  );
}

export function createLazyPage<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>
) {
  return createLazyComponent(
    importFn,
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

// Preload components for better UX
export function preloadComponent(importFn: () => Promise<any>) {
  // Use requestIdleCallback if available, otherwise setTimeout
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => importFn());
    } else {
      setTimeout(() => importFn(), 100);
    }
  }
}