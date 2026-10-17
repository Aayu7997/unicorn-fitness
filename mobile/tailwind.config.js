/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./App.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        background: 'var(--color-background)',
        card: 'var(--color-card)',
        text: 'var(--color-text)',
        border: 'var(--color-border)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        'pastel-peach': '#F9D3AF',
        'pastel-blue': '#A8C6CB',
        'pastel-pink': '#F3D0D7',
        'pastel-lavender': '#E4D8F3',
        'pastel-green': '#C4E5D4',
      },
    },
  },
  plugins: [],
}
