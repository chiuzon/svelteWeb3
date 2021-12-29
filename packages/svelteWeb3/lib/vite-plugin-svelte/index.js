import * as compiler from 'svelte/compiler';
import { createMakeHot } from 'svelte-hmr';

import { typescriptPreprocessor } from './typescript';


let makeHot = (...args) => (
	(makeHot = createMakeHot({ walk: compiler.walk }))(...args)
);

export function svelte (opts = {}) {
	let {
		compilerOptions = {},
		hotOptions = {},
		preprocess = [],
		typescript = true,
	} = opts;

	if (typescript) {
		preprocess = [typescriptPreprocessor, preprocess].flat();
	}

	let cssMap = new Map();
	let isProduction = false;

	return {
		name: 'vite-plugin-svelte',

		config () {
			return {
				dedupe: ['svelte'],
				optimizeDeps: {
					exclude: ['svelte-hmr'],
				},
			};
		},

		configResolved (config) {
			isProduction = config.isProduction;
		},

		resolveId (id) {
			if (!id.endsWith('.svelte.css')) return null;
			if (!cssMap.has(id.slice(0, -4))) return null;
			return id;
		},

		load (id) {
			if (!id.endsWith('.svelte.css')) return null;
			return cssMap.get(id.slice(0, -4)) || null;
		},

		async transform (source, filename, isSSR) {
			if (!filename.endsWith('.svelte')) return null;

			let dependencies = [];
			let finalOptions = {
				generate: isSSR ? 'ssr' : 'dom',
				css: !isProduction,
				format: 'esm',
				dev: !isProduction,
				...compilerOptions,
				filename,
			};

			if (preprocess) {
				let preprocessed = await compiler.preprocess(source, preprocess, { filename });
				if (preprocessed.dependencies) dependencies.push(...preprocessed.dependencies);
				if (preprocessed.map) finalOptions.sourcemap = preprocessed.map;
				source = preprocessed.code;
			}

			let compiled = compiler.compile(source, finalOptions);

			if (compiled.warnings) {
				for (let warn of compiled.warnings) {
					this.warn(warn);
				}
			}

			if (!finalOptions.css && compiled.css.code) {
				compiled.js.code = `import ${JSON.stringify(filename + '.css')};` + compiled.js.code;
				cssMap.set(filename, compiled.css);
			}

			if (!isProduction && hotOptions) {
				compiled.js.code = makeHot({
					id: filename,
					compiled: compiled,
					compiledCode: compiled.js.code,
					originalCode: source,
					compileOptions: finalOptions,
					hotOptions: {
						preserveLocalState: true,
						injectCss: true,
						...(typeof hotOptions == 'object' ? hotOptions : {}),
					},
				});
			}

			compiled.js.dependencies = dependencies;
			return compiled.js;
		},
	};
}