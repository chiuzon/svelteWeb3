import preprocess from 'svelte-preprocess';
import { nodeResolve } from '@rollup/plugin-node-resolve';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		ssr: false,
		
		vite: {
			
            define: {
				global: "window"
			},
			plugins: [
				// nodeResolve({
				// 	browser:true,
				// 	preferBuiltins: false
				// })
			]
        }
	}
};

export default config;
