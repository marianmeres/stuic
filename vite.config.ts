import { sveltekit } from "@sveltejs/kit/vite";
// import { defineConfig } from 'vite';
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: parseInt(process.env.DEV_PORT || "8888"),
	},
});
