"use strict";

/*!
 * koa-easy-websocket - webcosket.js
 * Copyright(c) 2016 LnsooXD
 * MIT Licensed
 */

const path = require('path');
const Event = require('./lib/event');
const session = require('koa-socket-session');
const IO = require('koa-socket.io');
const it = require('ctrl-it');
const co = require('co');
const is = require('is-type-of');
const debug = loadLib('debug')('koa-easy-websocket:webcosket.js');

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
        this.config = options['config'];
        this.namespace = namespace;
        this.io = io;
        this.app = app;

        io.use(session(app, app.session));

        it.each(this.config, (k, v)=> {
            let builer = require(path.join(this.dir, v));
            let event = new Event(k);
            builer(event);
            io.on(k, function *(next) {
                yield event.onMessage(this, this.data);
                yield next;
            });
        });

        app.websocket = this;
    }

    attach(server) {
        this.io.start(server);
    }

    broadcast(event, msg) {
        this.io.broadcast(event, msg);
    }

    use(middleware) {
        this.io.use(middleware);
        return this;
    }
};
