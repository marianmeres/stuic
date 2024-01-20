/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// example of what to do
				primary: 'rgb(var(--primary) / <alpha-value>)',
				'on-primary': 'rgb(var(--on-primary) / <alpha-value>)',
			},
		},
	},
	plugins: [require('@tailwindcss/forms')],
};
