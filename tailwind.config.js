/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./*.tsx",
        "./*.ts",
        "./components/**/*.{tsx,ts}",
        "./services/**/*.{tsx,ts}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
