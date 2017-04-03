'use strict';

const O = require('output-manager'); // console logging
const WebSocketServer = require('ws').Server;
const http = require('http');
const fs = require('fs');

O.i('Starting...');
var __wss = new WebSocketServer({
    port: 9000
});
O.i('WebSocketServer created...');

__wss.broadcast = function (data) {
    __wss.clients.forEach(function each(client) {
        client.send(data);
    });
};

const start = () => {
    O.i('Setting up websocket log stream');
    O.level(O.LogLevel.TRACE);
    O.setLogger(function (msg) {
        __wss.broadcast(msg);
    });
    setTimeout(heartbeat, 1000);
    setTimeout(streamSomeData, 1500);
}

__wss.on('connection', function connection(conn) {
    conn.on('message', function incoming(msg) {
        O.i('Incoming msg: ' + msg);
    });
    conn.send('Connected!');
});

const heartbeat = () => { O.i('heartbeat'); __wss.broadcast('hb'); setTimeout(heartbeat, 5000); }
const streamSomeData = () => { O.t('tracing'); O.d('debugging'); O.i('info-ing'); O.w('warning'); O.e('erroring'); O.f('fatal-ing'); setTimeout(streamSomeData, 500); }


O.i('Starting http server...');
__server = http.createServer(function (request, response) {
    fs.readFile('./index.html', function (err, data) {
        if (err) {
            response.writeHead(500, {
                'Content-Length': err.length,
                'Content-Type': 'text/plain'
            });
            response.end(err, 'utf-8');
        } else {
            response.writeHead(200, {
                'Content-Length': data.length,
                'Content-Type': 'text/html'
            });
            response.end(data, 'utf-8');
        }
    });
}).on('close', function () {
    O.i('Server closed...');
}).on('clientError', function (exception, socket) {
    O.e("Client error : '" + exception + "'");
}).listen(8888);

O.i('Everything started...');

start();
