'use strict';
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const path = require('path');
const info = require('./package.json');
const firebase = require('firebase');
const bodyParser = require('body-parser');
var users = [];
var connections = [];

server.listen(process.env.PORT || 80);
console.log('~~~~ Server Running on port 80');
console.log('~~~~ Test Build v1.1.0')

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client')));
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
});

app.post('/chat', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    ref.orderByChild('username').equalTo(username).on("value", function (snapshot) {
        snapshot.forEach((data) => {
            var key = data.key;
            var _users = firebase.database().ref('/users/' + key);
            _users.on('value', function (snapshot) {
                var _user = snapshot.val();
                var _username = _user.username;
                var _password = _user.password;
                if (username == _username && password == _password) {
                    res.sendFile(__dirname + "/client/chat.html");
                    console.log(_username, _password);
                } else {
                    res.redirect('/');
                    console.log('wrong details');
                }
            });
        });
    });
});

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDOwYMsW_qzgf4v30CvAFCTfcUlIvlMYEY",
    authDomain: "ritenow-1934.firebaseapp.com",
    databaseURL: "https://ritenow-1934.firebaseio.com",
    projectId: "ritenow-1934",
    storageBucket: "ritenow-1934.appspot.com",
    messagingSenderId: "354295418341"
};
firebase.initializeApp(config);
var ref = firebase.database().ref('/users');
// var user ={
//   username:"nikhil",
//   password:"123456"
// }

//ref.push(user);

io.sockets.on('connection', (socket) => {
    socket.emit('info', info);
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
            data += ": " + getRandomInt(6);
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