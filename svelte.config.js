import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';

const devConnectSrc = ['self', 'http://localhost:*', 'http://127.0.0.1:*', 'ws://localhost:*', 'ws://127.0.0.1:*'];
const productionConnectSrc = ['self'];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		adapter: adapter({ fallback: '200.html' }),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:'],
				'font-src': ['self', 'data:'],
				'connect-src': process.env.NODE_ENV === 'development' ? devConnectSrc : productionConnectSrc,
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self']
			}
		}
	},
	preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
	extensions: ['.svelte', '.svx', '.md']
};

export default config;
