# koa-easy-websocket
A easy-using koa websocket framework based on [koa-socket.io](https://github.com/LnsooXD/koa-socket.io)

## Installation
```sh
$ npm install koa-easy-websocket -d --save
```

## Usage
```js

/* app.js */

const WebSocket = require('koa-easy-websocket');
const app = require('koa')();

let ws = new WebSocket(app, {
    // The bese dir of websocket
    dir: path.join(__dirname, 'websocket'),
    // websocket path - socket file path pair
    config: {
      test: 'test',
      example: 'example',
      ...
    }
});

/* websocket/test.js */

module.exports = function (event) {
  
  event.on('test0', function* () { // test0 is an action
    let var data = this.data; // get the data from client
    ...
    this.send({ // send msg back to client
      msg: 'success',
      err: 0
    });
  });
};

/* client.js */
var event = 'test';

var socket = io();
socket.on('connect', function() {
  console.log('socket.io connected');
});

socket.on(event, function(msg) {
	console.log('socket.io event: ', event, " msg: ", msg);
	messageHandle(msg.action, msg.data);
});
		
socket.on('disconnect', function() {
	console.log('socket.io disconnected');
}.bind(this));

// a simple handle example, you can use EventEmitter replace it.
function messageHandle(action, data) {
  switch(action) {
    case 'test0':{
      console.log(data); // {msg: 'success', err: 0}
      break;
    }
    ...
  }
}

```

##Authors

- [LnsooXD](https://github.com/LnsooXD)

## License

- [MIT](http://spdx.org/licenses/MIT)
