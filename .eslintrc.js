module.exports = {
	env: {
		node: true,
		es6: true,
		mocha: true,
	},
	parserOptions: {
		ecmaVersion: 2018,
	},
	extends: 'eslint:recommended',
	ignorePatterns: ['node_modules/'],
	rules: {
		quotes: [2, 'single'],
		semi: [2, 'always'],

		'arrow-parens': ['error', 'always'], // обрамляй аргумент стрелочной функции в скобки
		'arrow-spacing': ['error', {before: true, after: true}], // ставь пробелы до и после стрелки в стрелочной функции
		'no-confusing-arrow': [
			'error',
			{
				allowParens: true,
			},
		], // не используй стрелочную функцию там где ее можно спутать со сравнением
		'constructor-super': 'error', // проверяй вызовы super() в конструкторах
		'no-this-before-super': 'error', // не используй this перед вызовом super() в конструкторах
		'no-useless-constructor': 'error', // запретить ненужный конструктор
		'no-const-assign': 'error', // запретить изменение переменных, объявленных с использованием const
		'no-var': 'error', // используй let или const вместо var
		'no-console': 'warn', // не используй console
		'keyword-spacing': 'error', // пробелы после if, else, for и прочего
		'prefer-const': 1, // не изменяется - объяви как константу
		'one-var': ['error', 'never'], // по определению переменной на строчку
		'spaced-comment': ['error', 'always'], // пробелы после двух слешей в комментарии
		'space-infix-ops': 'error', // пробелы между операторами
		'comma-spacing': ['error', {before: false, after: true}], // пробелов перед запятой быть не должно, зато должна быть после
		'no-unused-vars': 'warn', // удаляй не используемые переменные
		'template-curly-spacing': 'error', // используй пробелы в шаблонных строках
		'for-direction': 'error', // расставляй условия в цикле правильно
		'no-await-in-loop': 'error', // никаких await в цикле
		'no-dupe-else-if': 'off', // никаких if-else-if
		'valid-jsdoc': 'off', // валидация JSDoc
	},
};
