const asyncLocalStorage = require('async-local-storage');
const Bunyan = require('bunyan');

const Stream = require('./stream');
const TrimStream = require('./stream/trim');
const MapperStream = require('./stream/mapper');

const EMPTY_OBJECT = {};

const DEFAULT_TYPE = 'example';
const DEFAULT_LEVEL = 'INFO';
const DEFAULT_STREAM_TYPE = 'raw';

const HEADER_RM_REGEX = /(rm=).+?(;|$)/g;
const HEADER_SID_REGEX = /(sid=).+?(;|$)/g;
const HEADER_REPLACE_PATTERN = '$1***$2';
const HEADER_AUTHORIZATION_PATTERN = '***';

class Logger extends Bunyan {
	/**
	 * @typedef {Object} Logger.Settings.Dto
	 * @property {String} name
	 * @property {String} type
	 * @property {String} mode
	 * @property {String} path
	 * @property {String} level
	 * @property {Boolean} isTrim
	 * @property {Boolean} isJSON
	 * @property {Boolean} isMapper
	 * @property {Number} maxMessageLength
	 * @property {Boolean} [isAls]
	 * @property {Stream[]|TrimStream[]|MapperStream[]} [streams]
	 */

	/**
	 * @typedef {Object} Logger.Options.Dto
	 */

	/**
	 * @param {Logger.Settings.Dto|Logger} settings
	 * @param {Logger.Options.Dto} [options={}]
	 */
	constructor(settings, options) {
		super(Logger._init(settings), (options = EMPTY_OBJECT));

		this._options = options;
		this._settings = settings;
		if (settings instanceof Logger) {
			this._settings = settings._extractSettings();
		}

		this._meta = Logger._extractMeta(this._settings.isAls);
	}

	/**
	 * @typedef {Object} Logger.Serializers.Dto
	 * @property {(function(Request): {headers: Request.headers, method: String, url: String})} req
	 * @property {(function(Error): {stack: String, name: String, message: String})} err
	 * @property {(function(Headers): Object)} header
	 */

	/**
	 * @return {Logger.Serializers.Dto}
	 */
	static get Serializers() {
		return {
			/**
			 * @param {Headers} headers
			 * @return {Object}
			 */
			header: (headers) => {
				const headerList = {...headers};

				if (headerList.cookie) {
					headerList.cookie = headerList.cookie
						.replace(HEADER_SID_REGEX, HEADER_REPLACE_PATTERN)
						.replace(HEADER_RM_REGEX, HEADER_REPLACE_PATTERN);
				}

				if (headerList.authorization) {
					headerList.authorization = HEADER_AUTHORIZATION_PATTERN;
				}

				return headerList;
			},
			/**
			 * @param {Request} request
			 * @return {{headers: Object, method: String, url: String}}
			 */
			req: (request) => {
				return {
					url: request.url,
					method: request.method,
					headers: Logger.Serializers.header(request.headers),
				};
			},
			/**
			 * @param {Error} err
			 * @return {{stack: String, name: String, message: String}}
			 */
			err: (err) => {
				return {
					name: err.name,
					message: JSON.stringify(err.message),
					stack: err.stack,
				};
			},
		};
	}

	/**
	 * @param {Logger.Settings.Dto} settings
	 * @return {Logger}
	 */
	static create(settings) {
		return new Logger(settings);
	}

	/**
	 * @return {Logger.Settings.Dto}
	 * @private
	 */
	get _extractSettings() {
		return this._settings;
	}

	/**
	 * @param {Logger.Settings.Dto|Logger} settings
	 * @return {Logger|{serializers: Logger.Serializers.Dto, streams: (MapperStream[]|TrimStream[]|Stream[]), name: (String), type: (String)}}
	 * @private
	 */
	static _init(settings) {
		if (settings instanceof Logger) {
			return settings;
		}

		const meta = this.meta(settings.isAls);
		const streamList = [];

		const level = settings.level || DEFAULT_LEVEL;

		let serializerList = Logger.Serializers;
		if (settings.serializers) {
			serializerList = Object.assign(
				serializerList,
				settings.serializers
			);
		}

		if (settings.isMapper) {
			streamList.push({
				type: DEFAULT_STREAM_TYPE,
				level: level,
				stream: this._createStream(settings, meta),
			});
		} else if (settings.streams && settings.streams.length > 0) {
			streamList.push(...settings.streams);
		} else {
			streamList.push({
				type: DEFAULT_STREAM_TYPE,
				level: level,
				stream: new Stream(meta),
			});
		}

		return {
			name: settings.name || DEFAULT_TYPE,
			type: settings.type || DEFAULT_TYPE,
			streams: streamList,
			serializers: serializerList,
		};
	}

	/**
	 * @typedef {Object} Logger.Meta.Dto
	 * @property {get} get
	 * @property {set} set
	 */

	/**
	 * @param {Boolean} isAls
	 * @return {Logger.Meta.Dto}
	 * @private
	 */
	static _extractMeta(isAls) {
		if (isAls) {
			asyncLocalStorage.enable();

			return asyncLocalStorage;
		}

		return {
			get: (key) => {},
			set: (key, value) => {},
		};
	}

	/**
	 * @param {Logger.Settings.Dto} settings
	 * @param {Logger.Meta.Dto} meta
	 * @returns {TrimStream|MapperStream}
	 * @private
	 */
	static _createStream(settings, meta) {
		if (settings.isTrim) {
			return new TrimStream(meta, settings.maxMessageLength);
		}

		return new MapperStream(meta, settings.mode, settings.path);
	}

	/**
	 * @param {String|Number|Object} arg
	 * @param {String} rest
	 */
	json(arg, ...rest) {
		if (!this._settings.isJSON) {
			return;
		}

		let newArgs;
		if (typeof arg === 'string') {
			newArgs = [{level: 70}, arg];
		}

		if (typeof arg !== 'string') {
			newArgs = [{...arg, level: 70}];
		}

		const args = newArgs.concat(rest);
		this.info(...args);
	}

	/**
	 * @param {String|Number|Object} arg
	 * @param {String} rest
	 */
	log(arg, ...rest) {
		let args = {...rest};

		if (Array.isArray(rest)) {
			const key = rest[0];
			const value = rest[1];

			args = {[key]: value};
		}

		this.json({stringData: args}, arg);
	}
}

module.exports = Logger;
