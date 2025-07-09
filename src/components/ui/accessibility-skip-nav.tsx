import { cn } from '@/lib/utils';

interface SkipNavProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
  className?: string;
}

export function AccessibilitySkipNav({ 
  links = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#search', label: 'Skip to search' }
  ],
  className 
}: SkipNavProps) {
  return (
    <nav 
      className={cn(
        "sr-only focus-within:not-sr-only",
        "fixed top-0 left-0 z-[9999] bg-background border border-border p-4",
        "focus-within:sr-only-override",
        className
      )}
      aria-label="Skip navigation"
    >
      <ul className="flex gap-4">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={cn(
                "inline-flex items-center px-4 py-2 text-sm font-medium",
                "bg-primary text-primary-foreground rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "hover:bg-primary/90 transition-colors"
              )}
              onClick={(e) => {
                e.preventDefault();
                const target = document.querySelector(link.href);
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  // Focus the target if it's focusable, otherwise focus the first focusable child
                  if (target instanceof HTMLElement) {
                    if (target.tabIndex >= 0) {
                      target.focus();
                    } else {
                      const focusable = target.querySelector(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                      ) as HTMLElement;
                      focusable?.focus();
                    }
                  }
                }
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}