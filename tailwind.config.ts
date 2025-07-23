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
				'card': 'var(--shadow-card)',
				'card-hover': 'var(--shadow-card-hover)',
				'premium': '0 6px 20px -6px hsla(210, 22%, 15%, 0.15)',
				'avatar': '0 2px 8px hsla(210, 22%, 15%, 0.08)',
				'glass': 'var(--shadow-glass)',
				'glow': '0 0 20px hsl(var(--primary) / 0.3)',
				'glow-lg': '0 0 40px hsl(var(--primary) / 0.2)'
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'calc(var(--radius) + 4px)',
				'2xl': 'calc(var(--radius) + 8px)',
				'3xl': 'calc(var(--radius) + 12px)'
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
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
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
				'slide-up': {
					'0%': { 
						transform: 'translateY(20px)', 
						opacity: '0'
					},
					'100%': { 
						transform: 'translateY(0)', 
						opacity: '1'
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
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'glow': {
					'0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 0 transparent)' },
					'50%': { filter: 'brightness(1.1) drop-shadow(0 0 20px hsl(var(--primary) / 0.3))' }
				},
				// Sports UI shimmer skeleton
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				'confetti': {
					'0%': { transform: 'translateY(-100vh) rotate(0deg) scale(1)', opacity: '1' },
					'100%': { transform: 'translateY(100vh) rotate(720deg) scale(0.5)', opacity: '0' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'slide-down': 'slide-down 0.3s ease-out',
				'slide-up': 'slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
				'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out',
				'pulse-glow': 'pulse-glow 2s infinite',
				'bounce-light': 'bounce-light 1s ease-in-out',
				'float': 'float 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite linear',
				'confetti': 'confetti 1.2s ease-out forwards',
				'wiggle': 'wiggle 1s ease-in-out infinite'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }: any) {
			addUtilities({
				'.hover-scale': {
					'transition': 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					'will-change': 'transform',
					'&:hover': {
						'transform': 'scale(1.05)'
					}
				},
				'.hover-scale-102': {
					'transition': 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					'will-change': 'transform',
					'&:hover': {
						'transform': 'scale(1.02)'
					}
				},
				'.hover-lift': {
					'transition': 'all 0.3s ease',
					'will-change': 'transform, box-shadow',
					'&:hover': {
						'transform': 'translateY(-4px)',
						'box-shadow': 'var(--shadow-card-hover)'
					}
				},
				'.active-scale': {
					'transition': 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
					'&:active': {
						'transform': 'scale(0.95)'
					}
				},
				'.button-bounce': {
					'transition': 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
					'&:active': {
						'transform': 'scale(0.95)'
					}
				},
				'.success-flash': {
					'animation': 'glow 0.8s ease-out'
				},
				'.glass-effect': {
					'background': 'var(--glass-bg)',
					'backdrop-filter': 'var(--glass-blur)',
					'-webkit-backdrop-filter': 'var(--glass-blur)',
					'border': '1px solid var(--glass-border)',
					'box-shadow': 'var(--glass-shadow)'
				},
				'.text-gradient': {
					'background': 'var(--gradient-primary)',
					'-webkit-background-clip': 'text',
					'background-clip': 'text',
					'-webkit-text-fill-color': 'transparent'
				},
				'.backdrop-blur-xs': {
					'backdrop-filter': 'blur(2px)',
					'-webkit-backdrop-filter': 'blur(2px)'
				},
				'.backdrop-blur-3xl': {
					'backdrop-filter': 'blur(64px)',
					'-webkit-backdrop-filter': 'blur(64px)'
				},
				'.will-change-transform': {
					'will-change': 'transform'
				},
				'.will-change-opacity': {
					'will-change': 'opacity'
				},
				'.will-change-auto': {
					'will-change': 'auto'
				}
			});
		}
	],
} satisfies Config;