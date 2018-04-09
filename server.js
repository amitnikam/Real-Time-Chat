'use strict';
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var info = require('./package.json');
var users = [];
var connections = [];

server.listen(process.env.PORT || 80);
console.log('~~~~ Server Running ~~~~');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
    socket.emit('info',info);
    connections.push(socket);
    console.log('Connected: %s Sockets Connected', connections.length);

    socket.on('disconnect', (data) => {
        users.splice(users.indexOf(socket.username), 1);
        updateUserNames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected %s Sockets Connected', connections.length);
    });

    socket.on('send message', (data) => { 
        if (data == "Toss" || data == "toss" || data == "TOSS") {
            var bet = getRandomInt(2);
            if (bet == 0) {
                data += ": Heads";
            } else {
                data += ": Tails";
            }
        }
        if (data == "Dice" || data == "dice" || data == "DICE") {
            data += ": "+getRandomInt(6);
        }
        io.sockets.emit('new message', {
            msg: data,
            user: socket.username
        });
    });

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    socket.on('new user', (data, callback) => {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUserNames();
    });

    function updateUserNames() {
        io.sockets.emit('get users', users);
    }
});