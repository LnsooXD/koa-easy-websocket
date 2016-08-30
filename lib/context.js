"use strict";

/*!
 * koa-easy-websocket - lib/context.js
 * Copyright(c) 2016 LnsooXD
 * MIT Licensed
 */

exports = module.exports = class Context {
	constructor(event, ctx, msg) {
		this.configName = null;
		this.namespace = null;
		this.event = event;
		this.socket = ctx.socket;
		this.session = ctx.session;
		this.data = msg.data;
		this.action = msg.action;
	}

	send(data) {
		this.socket.emit(this.event.name, {
			action: this.action,
			data: data
		});
	};

	sendDefault(err) {
		this.send({
			error: err ? 1 : 0,
			msg: err ? err.toString() : 'success'
		});
	};

	broadcast(data) {
		this.socket.broadcast({
			action: this.action,
			data: data
		});
	};

};
