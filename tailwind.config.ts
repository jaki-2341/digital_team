import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Specific classes from the AI agent's prompt and presentation examples
    'w-full',
    'h-full',
    'h-screen',
    'min-h-screen',
    'bg-gradient-to-t',
    'bg-gradient-to-tr',
    'bg-gradient-to-r',
    'bg-gradient-to-br',
    'bg-gradient-to-b',
    'bg-gradient-to-bl',
    'bg-gradient-to-l',
    'bg-gradient-to-tl',
    'from-blue-50',
    'to-indigo-100',
    'from-indigo-100', 
    'to-blue-50',     
    'from-[#1D4ED8]',
    'to-[#60A5FA]',
    'bg-white',
    'bg-slate-100',
    'bg-gray-50',
    'hover:shadow-xl',
    'hover:scale-105',
    'hover:underline',
    'max-w-7xl', 
    'max-w-screen-lg',
    'max-w-screen-xl',
    'min-w-full',
    'animate-fade-in-up',
    'divide-y',
    'flex-shrink-0',
    'space-y-2', 'space-y-3', 'space-y-6',
    'transition',
    'ease-in-out',
    'relative', 'absolute', 'inset-0', 'z-0', 'z-10', 'z-20',
    'flex', 'items-center', 'justify-center', 'text-center',
    'font-extrabold', 'font-semibold', 'font-bold',
    'tracking-tight',
    'drop-shadow-lg',
    'object-cover',
    'opacity-0', 'opacity-10', 'opacity-20',
    'mix-blend-multiply',
    'backdrop-blur-sm',
    'rounded-xl', 'rounded-lg',
    'p-8', 'px-8', 'py-16',
    'grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-12',
    'md:order-first', 'md:order-last',
    'list-disc', 'pl-6',
    'leading-relaxed',
    
    // Specific Text Colors from AI prompt examples (covered by pattern too, but good to be explicit for key ones)
    'text-white',
    'text-yellow-300',
    'text-yellow-200',
    'text-gray-900',
    'text-gray-800',
    'text-gray-700',
    'text-gray-600',
    'text-blue-600', // for links
    'text-green-500', // for checklist icons

    // Patterns for dynamic classes
    // Colors (bg, text, border, divide, gradient stops)
    {
      pattern: /^(bg|text|border|divide|from|to|via)-(transparent|current|black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-([1-9]00|50|950)$/,
      variants: ['hover', 'focus', 'md', 'lg'],
    },
    // More flexible color pattern for hex codes
    {
        pattern: /^(bg|text|from|to|via)-\[\#\w+\]$/,
        variants: ['hover', 'focus', 'md', 'lg'],
    },
    // Background opacity
    {
      pattern: /bg-opacity-(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)/
    },
     // Opacity
    {
      pattern: /opacity-(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)/
    },
    // Rounded corners
    {
      pattern: /^(rounded)-(none|sm|md|lg|xl|2xl|3xl|full)$/,
      variants: ['hover'],
    },
    // Shadows
    {
      pattern: /^(shadow)-(none|sm|md|lg|xl|2xl|inner)$/,
      variants: ['hover'],
    },
    // Font sizes & weights
    {
      pattern: /^(text)-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
      variants: ['md', 'lg'],
    },
    {
      pattern: /^(font)-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
    },
    // Spacing (padding, margin, gap) - for values like p-6, mb-4, gap-6, px-8, mr-2
    {
      pattern: /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y)-[0-9]+(?:px)?$/, // Added ?px for explicit px units if AI generates them
      variants: ['md', 'lg'],
    },
    // Sizing (width, height) - for values like w-5, h-5
    {
      pattern: /^(w|h|max-w|min-h)-.+$/,
      variants: ['md', 'lg'],
    },
    // Flexbox & Grid utilities
    {
      pattern: /^(flex|grid|items|justify|content)-(start|end|center|between|around|evenly|stretch|baseline|normal)$/,
    },
    'flex-col', 'flex-row', 
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', // Common grid column counts
    {
        pattern: /^grid-cols-[0-9]+$/, // More general grid column counts
        variants: ['sm', 'md', 'lg'],
    },
    // Transitions & Transforms
    {
        pattern: /^duration-[0-9]+$/,
    },
    {
        pattern: /^ease-(linear|in|out|in-out)$/,
    },
    {
        pattern: /^scale-[0-9]+$/,
        variants: ['hover', 'focus'],
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Space Grotesk', 'sans-serif'],
        code: ['monospace'],
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
        messageAppear: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'message-appear': 'messageAppear 0.3s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography')
  ],
} satisfies Config;
