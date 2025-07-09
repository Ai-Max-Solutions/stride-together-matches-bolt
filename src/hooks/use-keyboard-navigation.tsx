import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onSpace?: () => void;
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardNavigation({
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEnter,
  onEscape,
  onSpace,
  enabled = true,
  preventDefault = true
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
    
    // Don't interfere with modifier key combinations
    if (ctrlKey || metaKey || shiftKey || altKey) return;
    
    // Don't interfere with input elements unless explicitly wanted
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                   target.tagName === 'TEXTAREA' || 
                   target.tagName === 'SELECT' ||
                   target.contentEditable === 'true';
    
    if (isInput && !target.hasAttribute('data-keyboard-nav')) return;

    let handled = false;

    switch (key) {
      case 'ArrowUp':
        if (onArrowUp) {
          onArrowUp();
          handled = true;
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          onArrowDown();
          handled = true;
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          onArrowLeft();
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          onArrowRight();
          handled = true;
        }
        break;
      case 'Enter':
        if (onEnter) {
          onEnter();
          handled = true;
        }
        break;
      case 'Escape':
        if (onEscape) {
          onEscape();
          handled = true;
        }
        break;
      case ' ':
        if (onSpace) {
          onSpace();
          handled = true;
        }
        break;
    }

    if (handled && preventDefault) {
      event.preventDefault();
    }
  }, [
    enabled,
    preventDefault,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    onSpace
  ]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    // Helper to make elements keyboard navigable
    makeKeyboardNavigable: (element: HTMLElement) => {
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
      element.setAttribute('data-keyboard-nav', 'true');
    },
    
    // Helper to remove keyboard navigation
    removeKeyboardNavigation: (element: HTMLElement) => {
      element.removeAttribute('data-keyboard-nav');
      if (element.getAttribute('tabindex') === '0') {
        element.removeAttribute('tabindex');
      }
    }
  };
}