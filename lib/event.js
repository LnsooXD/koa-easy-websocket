"use strict";

/*!
 * koa-easy-websocket - lib/event.js
 * Copyright(c) 2016 LnsooXD
 * MIT Licensed
 */


const Context = require('./context');

exports = module.exports = class Event {

	constructor(_event) {
		readonlyProp(this, '_name', _event);
		this.callbacks = {};
	}

	*onMessage(ctx, msg) {
		if (this.callbacks.hasOwnProperty(msg.action)) {
			let callback = this.callbacks[msg.action];
			let context = new Context(this, ctx, msg);
			try {
				yield callback.call(context);
			} catch (e) {
				context.sendDefault(e);
			}
		}
	};

	get name() {
		return this._name;
	}

	on(action, callback) {
		this.callbacks[action] = callback;
	}
};

function readonlyProp(obj, propName, value) {
	Object.defineProperty(obj, propName, {
		value: value,
		writable: false
	});
}



