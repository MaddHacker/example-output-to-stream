/**
 * Copyright 2017 MaddHacker
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const om = require('output-manager');
const O = new om.Out(); // console logging
const sOut = new om.Out(); // stream logging

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
    sOut.level = om.LogLevel.TRACE;
    sOut.output = (msg) => { __wss.broadcast(msg); };
    setTimeout(heartbeat, 1000);
    setTimeout(streamSomeData, 1500);
}

__wss.on('connection', function connection(conn) {
    conn.on('message', function incoming(msg) {
        O.i('Incoming msg: ' + msg);
    });
    O.i('Connected!')
    conn.send('Connected!');
});

const heartbeat = () => {
    O.i('heartbeat');
    sOut.i('heartbeat');
    __wss.broadcast('hb');
    setTimeout(heartbeat, 5000);
}

const streamSomeData = () => {
    O.i('Streaming some data...');
    sOut.t('tracing');
    sOut.d('debugging');
    sOut.i('info-ing');
    sOut.w('warning');
    sOut.e('erroring');
    sOut.f('fatal-ing');
    O.i('Sleeping...');
    setTimeout(streamSomeData, 500);
}


O.i('Starting http server...');
const __server = http.createServer(function (request, response) {
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
