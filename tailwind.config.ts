import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Fitness-specific colors
				running: 'hsl(var(--running))',
				cycling: 'hsl(var(--cycling))',
				fitness: 'hsl(var(--fitness))',
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				// Sports activity colors using CSS variables
				activity: {
					run: 'hsl(var(--activity-run))',
					cycle: 'hsl(var(--activity-cycle))',
					workout: 'hsl(var(--activity-workout))',
					yoga: 'hsl(var(--activity-yoga))',
				},
				// Match level colors using CSS variables
				match: {
					high: 'hsl(var(--match-high))',
					medium: 'hsl(var(--match-medium))',
					low: 'hsl(var(--match-low))',
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)'
			},
			boxShadow: {
				'primary': 'var(--shadow-primary)',
				'accent': 'var(--shadow-accent)',
				'card': '0 4px 6px hsla(210, 22%, 15%, 0.08)',
				'card-hover': '0 8px 12px hsla(210, 22%, 15%, 0.12)',
				'premium': '0 6px 20px -6px hsla(210, 22%, 15%, 0.15)',
				'avatar': '0 2px 8px hsla(210, 22%, 15%, 0.08)',
				'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'bounce': 'var(--transition-bounce)'
			},
			borderRadius: {
				lg: '12px', // Sports theme: 12px
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'slide-down': {
					'0%': { 
						transform: 'translateY(-10px)', 
						opacity: '0',
						maxHeight: '0'
					},
					'100%': { 
						transform: 'translateY(0)', 
						opacity: '1',
						maxHeight: '600px'
					}
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--primary) / 0.4)' },
					'50%': { boxShadow: '0 0 0 8px hsl(var(--primary) / 0)' }
				},
				'bounce-light': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-3px)' }
				},
				// Sports UI shimmer skeleton
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'slide-down': 'slide-down 0.3s ease-out',
				'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
				'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out',
				'pulse-glow': 'pulse-glow 2s infinite',
				'bounce-light': 'bounce-light 1s ease-in-out',
				'shimmer': 'shimmer 2s infinite linear',
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }: any) {
			addUtilities({
				'.hover-scale': {
					'transition': 'transform 0.2s ease',
					'&:hover': {
						'transform': 'scale(1.05)'
					}
				},
				'.hover-lift': {
					'transition': 'all 0.3s ease',
					'&:hover': {
						'transform': 'translateY(-4px)',
						'box-shadow': 'var(--shadow-card)'
					}
				},
				'.glass-effect': {
					'background': 'hsl(var(--background) / 0.8)',
					'backdrop-filter': 'blur(8px)',
					'border': '1px solid hsl(var(--border) / 0.5)'
				},
				'.button-bounce': {
					'transition': 'all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
					'&:active': {
						'transform': 'scale(0.95)'
					}
				},
				'.success-flash': {
					'animation': 'pulse-glow 0.8s ease-out'
				}
			});
		}
	],
} satisfies Config;
