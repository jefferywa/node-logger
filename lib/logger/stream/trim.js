const Stream = require('./index');
const MapperStream = require('./mapper');

class TrimStream extends MapperStream {
	/**
	 * @param {NodeLogger.Meta.Dto} meta
	 * @param {Number} maxMessageLength
	 */
	constructor(meta, maxMessageLength) {
		super(meta);
		this._maxMessageLength = maxMessageLength || 1024;
	}

	_map(rec) {
		const {
			data,
			message,
			level,
			level_number: levelNumber,
			...rest
		} = super._map(rec);

		if (level === Stream.Levels[70]) {
			return {data, level, message, ...rest};
		}

		const isLevelE =
			level === Stream.Levels[50] &&
			data &&
			Object.keys(data).length === 1;

		if (isLevelE) {
			return {data, level, message, ...rest};
		}

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

module.exports = TrimStream;
