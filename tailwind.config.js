/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// example of what to do... "primary" and "secodary" are supported
				'stuic-primary': 'rgb(var(--stuic-primary) / <alpha-value>)',
				'stuic-on-primary': 'rgb(var(--stuic-on-primary) / <alpha-value>)',
				'stuic-primary-dark': 'rgb(var(--stuic-primary-dark) / <alpha-value>)',
				'stuic-on-primary-dark': 'rgb(var(--stuic-on-primary-dark) / <alpha-value>)',
			},
		},
	},
	plugins: [require('@tailwindcss/forms')],
};
