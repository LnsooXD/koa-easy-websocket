"use strict";
if (typeof loadLib === 'undefined') {
	require('iooly-cornerstone');
}
const path = loadLib('path');
const Event = loadLib('./lib/event');
const session = loadLib('koa-socket-session');
const IO = require('koa-socket');
const cutils = loadLib('cutils');
const co = cutils.co;

exports = module.exports = class WebSocket {
	constructor(app, options) {
		if (cutils.is.nullOrUndefined(options)) {
			options = {};
		}
		let namespace = options['namespace'];
		let io;
		if (cutils.is.string(namespace)) {
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

		cutils.each(this.config, (k, v)=> {
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
