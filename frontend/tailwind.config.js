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
                // Terracotta — couleur de marque principale (chaleureuse, locale)
                primary: {
                    50: '#fbf3ef',
                    100: '#f6e1d7',
                    200: '#ebc3af',
                    300: '#dd9e80',
                    400: '#ce7c57',
                    500: '#c2613f', // Main Brand Color
                    600: '#a94f31',
                    700: '#8a3f28',
                    800: '#6e3422',
                    900: '#5a2c1e',
                },
                // Olive — secondaire (nature, entraide)
                secondary: {
                    50: '#f2f4ea',
                    100: '#e0e5c9',
                    200: '#c4cd9d',
                    300: '#a3b06e',
                    400: '#84934b',
                    500: '#6b7a3b',
                    600: 