"use strict";
const path = require('path');
const Event = require('./lib/event');
const session = require('koa-socket-session');
const IO = require('koa-socket');
const it = require('ctrl-it');
const co = require('co');
const is = require('is-type-of');

exports = module.exports = class WebSocket {
	constructor(app, options) {
		if (is.nullOrUndefined(options)) {
			options = {};
		}
		let namespace = options['namespace'];
		let io;
		if (is.string(namespace)) {
			io = new IO({namespace: namespace});
		} else {
			io = new IO();
		}
		this.dir = options['dir'];
		this.session = options['session'];
		this.config = options['config'];
		this.namespace = namespace;
		this.io = io;
		this.app = app;

		io.on('connection', ctx => {
			console.log('Join event', ctx.socket.id);
		});

		io.on('disconnect', ctx => {
			console.log('Leave event', ctx.socket.id);
		});

		io.use(session(app, app.session));

		it.each(this.config, (k, v)=> {
			let builer = loadLib(path.join(this.dir, v));
			let event = new Event(k);
			builer(event);
			io.on(k, co.wrap(function *(ctx, msg) {
				yield event.onMessage(ctx, msg);
			}));
		});

		app.websocket = this;
	}

	attach(server) {
		this.session = this.app.session;
		this.app.server = server;
		this.io.attach(this.app);
	}

	broadcast(event, msg) {
		this.io.broadcast(event, msg);
	}

	use(middleware) {
		this.io.use(wrap(middleware));
		return this;
	}

	static newWebSocket(app, options) {
		return new WebSocket(app, options);
	}

};

function wrap(middleware) {
	return co.wrap(function *(ctx, next) {
		try {
			yield middleware.call(ctx, next);
		} catch (e) {
			console.log(e);
		}
	});
}
