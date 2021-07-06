const fs = require('fs');

const Stream = require('./index');

const DEFAULT_WRITE_MODE = 'STDOUT';

class MapperStream {
	/**
	 * @param {NodeLogger.Meta.Dto} meta
	 * @param {String} [mode]
	 * @param {String} [path]
	 */
	constructor(meta, mode = DEFAULT_WRITE_MODE, path) {
		this._meta = meta;
		this._mode = mode || DEFAULT_WRITE_MODE;
		this._path = path;
	}

	/**
	 * @param {Object} rec
	 * @return {Object}
	 */
	_map(rec) {
		const {
			msg,
			hostname,
			type,
			zone,
			name,
			time,
			level,
			__meta,
			...rest
		} = rec;

		let data;
		if (Object.keys(rest).length) {
			data = rest;
		}

		return {
			'@timestamp': time,
			source_host: hostname,
			name,
			type,
			zone,
			level: Stream.Levels[level],
			level_number: level,
			message: msg,
			data,
			...__meta,
			...this._meta.get('log-meta'),
		};
	}

	write(rec) {
		if (this._mode !== DEFAULT_WRITE_MODE) {
			const writeStream = fs.createWriteStream(
				`${this._path}/${process.pid}.log`,
				{
					flags: 'a',
				}
			);

			writeStream.write(`${JSON.stringify(this._map(rec))}\n`);
		} else {
			process.stdout.write(`${JSON.stringify(this._map(rec))}\n`);
		}
	}
}

module.exports = MapperStream;
