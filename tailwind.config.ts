import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'sans-serif'],
        headline: ['var(--font-headline)', 'sans-serif'],
        cover: ['var(--font-cover)', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'glitch-skew': {
          '0%, 10%, 15.001%, 50%, 55.001%, 90%, 95.001%, 100%': { transform: 'skew(0deg)' },
          '10.001%': { transform: 'skew(5deg)' },
          '15%': { transform: 'skew(-5deg)' },
          '50.001%': { transform: 'skew(-3deg)' },
          '55%': { transform: 'skew(3deg)' },
          '90.001%': { transform: 'skew(8deg)' },
          '95%': { transform: 'skew(-8deg)' },
        },
        'glitch-anim-1': {
          '0%': { clipPath: 'inset(13% 0 2% 0)'},
          '10%': { clipPath: 'inset(45% 0 52% 0)'},
          '20%': { clipPath: 'inset(18% 0 33% 0)'},
          '30%': { clipPath: 'inset(33% 0 11% 0)'},
          '40%': { clipPath: 'inset(81% 0 1% 0)'},
          '50%': { clipPath: 'inset(45% 0 52% 0)'},
          '60%': { clipPath: 'inset(9% 0 88% 0)'},
          '70%': { clipPath: 'inset(55% 0 1% 0)'},
          '80%': { clipPath: 'inset(10% 0 55% 0)'},
          '90%': { clipPath: 'inset(92% 0 2% 0)'},
          '100%': { clipPath: 'inset(1% 0 92% 0)'},
        },
        'glitch-anim-2': {
          '0%': { clipPath: 'inset(78% 0 23% 0)'},
          '10%': { clipPath: 'inset(23% 0 1% 0)'},
          '20%': { clipPath: 'inset(1% 0 82% 0)'},
          '30%': { clipPath: 'inset(99% 0 1% 0)'},
          '40%': { clipPath: 'inset(2% 0 55% 0)'},
          '50%': { clipPath: 'inset(43% 0 52% 0)'},
          '60%': { clipPath: 'inset(10% 0 88% 0)'},
          '70%': { clipPath: 'inset(99% 0 1% 0)'},
          '80%': { clipPath: 'inset(1% 0 55% 0)'},
          '90%': { clipPath: 'inset(2% 0 92% 0)'},
          '100%': { clipPath: 'inset(88% 0 2% 0)'},
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'glitch-skew': 'glitch-skew 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite',
        'glitch-1': 'glitch-anim-1 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite',
        'glitch-2': 'glitch-anim-2 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
