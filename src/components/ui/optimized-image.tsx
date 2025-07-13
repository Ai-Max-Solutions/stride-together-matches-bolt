import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallback = '/placeholder.svg',
  placeholder,
  width,
  height,
  priority = false
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  const getOptimizedSrc = (originalSrc: string, w?: number, h?: number) => {
    // For Supabase storage URLs, we can add transformation parameters
    if (originalSrc.includes('supabase')) {
      const url = new URL(originalSrc);
      if (w) url.searchParams.set('width', w.toString());
      if (h) url.searchParams.set('height', h.toString());
      url.searchParams.set('quality', '80');
      url.searchParams.set('format', 'webp');
      return url.toString();
    }
    return originalSrc;
  };

  const generateSrcSet = (originalSrc: string) => {
    if (!originalSrc.includes('supabase')) return '';
    
    const sizes = [480, 768, 1024, 1920];
    return sizes
      .map(size => `${getOptimizedSrc(originalSrc, size)} ${size}w`)
      .join(', ');
  };

  const imageSrc = hasError ? fallback : (src && isInView ? getOptimizedSrc(src, width, height) : placeholder);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Blur placeholder */}
      {placeholder && !isLoaded && isInView && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110 transition-opacity duration-300"
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={imageSrc}
        srcSet={src && isInView ? generateSrcSet(src) : undefined}
        sizes="(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1920px"
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
}