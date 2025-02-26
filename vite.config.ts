import { sveltekit } from "@sveltejs/kit/vite";
// import { defineConfig } from 'vite';
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
});
