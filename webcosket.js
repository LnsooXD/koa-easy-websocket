"use strict";
if (typeof loadLib === 'undefined') {
	require('iooly-cornerstone');
}
const path = loadLib('path');
const Event = loadLib('./lib/event');
const IO = require('koa-socket');
const cutils = loadLib('cutils');
const Cookies = require('cookies');
const compose = loadLib('koa-compose');

exports = module.exports = cutils.class({
	namespace: null,
	app: null,
	io: null,
	session: null,
	dir: null,
	config: null,
	userCache: {},
	server: null,
	middleware: [],
	init: function (app, options) {
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

		app.websocket = this;
	}
});

exports.fn.attach = function (server) {
	this.session = this.app.session;
	this.server = server;
	this.app.server = server;
	this.io.attach(this.app);
	initEvents.call(this);
};

exports.fn.broadcast = function (event, msg) {
	this.io.broadcast(event, msg);
};

exports.fn.use = function (func) {
	this.middleware.push(func);
	return this;
};

exports.newWebSocket = (app, options) => {
	return new exports(app, options);
};

exports.newEvent = ()=> {
	return new Event();
};

function initEvents() {
	cutils.each(this.config, (k, v)=> {
		let event = loadLib(path.join(this.dir, v));
		this.io.on(k, (packet, data) => {
			packetHandler.call(this, event, packet, data);
		});
	});
}

function packetHandler(event, packet, data) {
	const $this = this;
	cutils.ao(function*() {
		yield parseSession.call($this, packet);
		if ($this.middleware.length > 0) {
			yield compose($this.middleware).call(packet);
		}
		yield event.onMessage(packet, data);
	}, function (err) {
		console.log(err);
		if (err) {
			throw err;
		}
	});
}

function *parseSession(packet) {
	let socket = packet.socket.socket;
	packet.url = socket.request.url;
	if (!packet.cookies) {
		packet.cookies = new Cookies(socket.handshake, socket.handshake, {
			keys: this.app.keys,
			secure: socket.handshake.secure
		});
	}
	yield this.session.call(packet, nup());
}

function *nup() {
}



