class Stream {
	/**
	 * @param {Logger.Meta.Dto} meta
	 */
	constructor(meta) {
		this._meta = meta;
	}

	/**
	 * @typedef {Object} Stream.Levels
	 * @property {String} 70
	 * @property {String} 60
	 * @property {String} 50
	 * @property {String} 40
	 * @property {String} 30
	 * @property {String} 20
	 * @property {String} 10
	 */

	/**
	 * @type {Stream.Levels}
	 * @private
	 */
	static get Levels() {
		return {
			70: 'Z',
			60: 'C',
			50: 'E',
			40: 'W',
			30: 'I',
			20: 'D',
			10: 'T',
		};
	}

	/**
	 * @param {Object} rec
	 * @return {Object}
	 */
	_map(rec) {
		const {msg, __meta, ...rest} = rec;

		return {
			'@timestamp': new Date(),
			...rest,
			level: Stream.Levels[rec.level],
			msg,
			level_number: rec.level,
			...__meta,
			...this._meta.get('log-meta'),
		};
	}

	/**
	 * @param {Object} rec
	 */
	write(rec) {
		process.stdout.write(`${JSON.stringify(this._map(rec))}\n`);
	}
}

module.exports = Stream;
