import esbuild from 'esbuild';

export let typescriptPreprocessor = {
	async script ({ content, filename, attributes }) {
		if (attributes.lang != 'ts') return null;

		let result = await esbuild.transform(content, {
			loader: 'ts',
			target: 'esnext',
			sourcefile: filename,
			tsconfigRaw: {
				compilerOptions: {
					importsNotUsedAsValues: 'preserve',
				},
			},
		});

		return result;
	},
};