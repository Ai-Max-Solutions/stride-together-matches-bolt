// Lazy-loaded flash run modals for better performance
import { createLazyModal, preloadComponent } from '@/lib/lazy-loader';

// Lazy load flash run modals
export const LazyFlashRunModal = createLazyModal(() => import('./FlashRunModal'));
export const LazyFlashRideModal = createLazyModal(() => import('./FlashRideModal'));
export const LazyFlashWorkoutModal = createLazyModal(() => import('./FlashWorkoutModal'));
export const LazyFlashYogaModal = createLazyModal(() => import('./FlashYogaModal'));

// Preload modals on user interaction hints
export function preloadFlashRunModals() {
  preloadComponent(() => import('./FlashRunModal'));
  preloadComponent(() => import('./FlashRideModal'));
  preloadComponent(() => import('./FlashWorkoutModal'));
  preloadComponent(() => import('./FlashYogaModal'));
}