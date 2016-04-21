"use strict";
const cutils = loadLib('cutils');
const Context = loadLib('./context');

exports = module.exports = class Event {

	constructor(_event) {
		cutils.readonlyProp(this, 'name', _event);
		this.callbacks = {};
	}

	*onMessage(packet, msg) {
		if (this.callbacks.hasOwnProperty(msg.action)) {
			let callback = this.callbacks[msg.action];
			let context = new Context(this, packet, msg);
			try {
				yield callback.call(context);
			} catch (e) {
				context.sendDefault(e);
			}
		}
	};

	on(action, callback) {
		this.callbacks[action] = callback;
	}
};



