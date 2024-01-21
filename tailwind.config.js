/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// example of what to do
				'stuic-primary': 'rgb(var(--stuic-primary) / <alpha-value>)',
				'stuic-on-primary': 'rgb(var(--stuic-on-primary) / <alpha-value>)',
			},
		},
	},
	plugins: [require('@tailwindcss/forms')],
};
