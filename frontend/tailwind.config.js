/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Mulish', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
            },
            colors: {
                // Bleu pétrole — couleur de marque principale
                primary: {
                    50: '#eef4f5',
                    100: '#d4e4e7',
                    200: '#abc9ce',
                    300: '#78a6af',
                    400: '#45818d',
                    500: '#2a6573',
                    600: '#1f5562', // Main Brand Color
                    700: '#1a454f',
                    800: '#163840',
                    900: '#132e34',
                    950: '#0d1f23',
                },
                // Ardoise teal — secondaire (surfaces sombres)
                secondary: {
                    50: '#eef3f3',
                    100: '#d2e0e0',
                    200: '#aac3c4',
                    300: '#79a0a1',
                    400: '#4e7b7d',
                    500: '#356164',
                    600: '#285054',
                    700: '#214246',
                    800: '#1a363a',
                    900: '#12262b',
                    950: '#0d1d21',
                },
                // Corail — accent ponctuel (premium, mise en avant)
                accent: {
                    50: '#fdf0ec',
                    100: '#f9d3c8',
                    200: '#f3b1a0',
                    300: '#ec8a72',
                    400: '#e6735a',
                    500: '#e0654b',
                    600: '#c44c34',
                    700: '#a03c29',
                    800: '#7c2f21',
                    900: '#5f261b',
                    950: '#38150e',
                },
                // Neutres frais
                cream: '#f1f4f4',
                paper: '#fafbfb',
                ink: '#1b2a2e',
            },
            boxShadow: {
                'soft': '0 1px 2px rgba(20, 30, 32, 0.04), 0 8px 24px -12px rgba(20, 30, 32, 0.18)',
                'card': '0 1px 0 rgba(20, 30, 32, 0.04), 0 12px 32px -16px rgba(20, 30, 32, 0.22)',
            },
            borderRadius: {
                'xl2': '1.25rem',
            },
        },
    },
    plugins: [],
}
