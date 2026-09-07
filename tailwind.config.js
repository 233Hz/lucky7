/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Comic Style primary & signature palette
        comic: {
          paper: '#fffef0',
          ink: '#1a1a1a',
          red: '#ef4444',
          yellow: '#facc15',
          blue: '#3b82f6',
          green: '#22c55e',
          muted: '#4a4a4a',
        },
        // Mapped brutal aliases for seamless transition
        brutal: {
          pink: '#ef4444',     // mapped to comic red
          lime: '#facc15',     // mapped to comic yellow
          cyan: '#3b82f6',     // mapped to comic blue
          orange: '#f59e0b',   // comic warm amber
          yellow: '#facc15',   // comic yellow
          bg: '#fffef0',       // comic paper
          dark: '#1a1a1a'      // comic ink
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d'
        },
        gold: {
          400: '#fde047',
          500: '#facc15',
          600: '#eab308'
        }
      },
      boxShadow: {
        // Comic Style hard-edge offset shadows (Zero blur)
        'comic-sm': '3px 3px 0px 0px rgba(26,26,26,1)',
        'comic': '4px 4px 0px 0px rgba(26,26,26,1)',
        'comic-hover': '2px 2px 0px 0px rgba(26,26,26,1)',
        'comic-md': '6px 6px 0px 0px rgba(26,26,26,1)',
        'comic-lg': '8px 8px 0px 0px rgba(26,26,26,1)',
        'comic-xl': '12px 12px 0px 0px rgba(26,26,26,1)',

        // Brutal aliases mapped to comic ink shadows
        'brutal-sm': '3px 3px 0px 0px rgba(26,26,26,1)',
        'brutal': '4px 4px 0px 0px rgba(26,26,26,1)',
        'brutal-hover': '2px 2px 0px 0px rgba(26,26,26,1)',
        'brutal-lg': '8px 8px 0px 0px rgba(26,26,26,1)',
        'brutal-xl': '12px 12px 0px 0px rgba(26,26,26,1)'
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
        '6': '6px'
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      }
    },
  },
  plugins: [],
}
