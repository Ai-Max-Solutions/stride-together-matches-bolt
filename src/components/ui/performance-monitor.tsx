import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  renderTime: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  className?: string;
}

export function PerformanceMonitor({ enabled = false, className }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: 0,
    loadTime: 0,
    renderTime: 0
  });

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memory: (performance as any).memory?.usedJSHeapSize 
            ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
            : 0,
          loadTime: Math.round(performance.timing?.loadEventEnd - performance.timing?.navigationStart) || 0,
          renderTime: Math.round(performance.now())
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className={cn(
      "fixed top-4 left-4 z-[9999] p-3 rounded-lg glass-heavy text-xs font-mono",
      "border border-white/20 shadow-lg backdrop-blur-xl",
      className
    )}>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span>FPS:</span>
          <span className={cn(
            "font-bold",
            metrics.fps >= 55 ? "text-green-400" :
            metrics.fps >= 30 ? "text-yellow-400" : "text-red-400"
          )}>
            {metrics.fps}
          </span>
        </div>
        
        {metrics.memory > 0 && (
          <div className="flex justify-between gap-4">
            <span>Memory:</span>
            <span className={cn(
              "font-bold",
              metrics.memory < 50 ? "text-green-400" :
              metrics.memory < 100 ? "text-yellow-400" : "text-red-400"
            )}>
              {metrics.memory}MB
            </span>
          </div>
        )}
        
        <div className="flex justify-between gap-4">
          <span>Load:</span>
          <span className={cn(
            "font-bold",
            metrics.loadTime < 2000 ? "text-green-400" :
            metrics.loadTime < 4000 ? "text-yellow-400" : "text-red-400"
          )}>
            {metrics.loadTime}ms
          </span>
        </div>
      </div>
    </div>
  );
}

// Hook for performance monitoring
export function usePerformanceMonitor() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Enable in development or when URL contains ?perf=true
    const urlParams = new URLSearchParams(window.location.search);
    const shouldEnable = import.meta.env.DEV || urlParams.get('perf') === 'true';
    setIsEnabled(shouldEnable);
  }, []);

  return { isEnabled, setIsEnabled };
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for expensive operations
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for scroll/resize events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Intersection Observer for lazy loading
  createIntersectionObserver: (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) => {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  },

  // Preload critical resources
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  // Measure component render time
  measureRenderTime: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    console.log(`${componentName} render time: ${end - start}ms`);
  },

  // Check if device prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get device capabilities
  getDeviceCapabilities: () => {
    return {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isLowEnd: navigator.hardwareConcurrency <= 2,
      supportsWebP: (() => {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      })(),
      supportsBackdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
      connectionSpeed: (navigator as any).connection?.effectiveType || 'unknown'
    };
  }
};