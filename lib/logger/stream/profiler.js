const Stream = require('./index');
const MapperStream = require('./mapper');

class ProfilerStream extends MapperStream {
	/**
	 * @typedef {Object} ProfilerStream.Options.Dto
	 */

	/**
	 * @param {NodeLogger.Meta.Dto} meta
	 * @param {ProfilerStream.Options.Dto} options
	 */
	constructor(meta, options) {
		super(meta);

		this._options = options;
	}

	/**
	 * @param {Object} rec
	 * @return {Object}
	 */
	_map(rec) {
		const {message, level, level_number: levelNumber, ...rest} = super._map(
			rec
		);

		return {
			level: level,
			level_number: levelNumber,
			message:
				message.length > this._maxMessageLength
					? message.slice(0, this._maxMessageLength).concat('...')
					: message,
			...rest,
		};
	}
}

module.exports = ProfilerStream;
