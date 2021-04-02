module.exports = {
	source: {
		includePattern: '.js$',
		include: ['.', 'package.json', 'README.md'],
		excludePattern: '(node_modules/|docs/)',
	},
	opts: {
		destination: './docs/',
		encoding: 'utf8',
		recurse: true,
		private: true,
		template: 'node_modules/braintree-jsdoc-template',
	},
	plugins: ['jsdoc-route-plugin', 'plugins/markdown'],
	sourceType: '.',
	tags: {
		allowUnknownTags: true,
		dictionaries: ['jsdoc', 'closure'],
	},
	templates: {
		cleverLinks: false,
		monospaceLinks: false,
		referenceTitle: 'DEMO API',
	},
};
