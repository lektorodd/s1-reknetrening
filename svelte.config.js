import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			// Served for any address the build has no page for, so a mistyped or
			// outdated link gets the app's own Nynorsk error page instead of the
			// host's.
			fallback: '404.html',
			precompress: true
		}),
		prerender: {
			entries: ['*']
		}
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) =>
			filename.includes('node_modules') ? undefined : { runes: true }
	}
};

export default config;
