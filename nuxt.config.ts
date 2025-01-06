// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],

	runtimeConfig: {
		spotifySecret: process.env.SPOTIFY_CLIENT_SECRET, // Private key
		public: {
			spotifyClient: process.env.SPOTIFY_CLIENT_ID, // Public key
		},
	},
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},

	modules: ['@nuxt/fonts', '@nuxt/icon'],
	compatibilityDate: '2025-01-05',
});
