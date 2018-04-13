'use strict';
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const path = require('path');
const info = require('./package.json');
const firebase = require('firebase');
const bodyParser = require("body-parser");
var users = [];
var connections = [];

server.listen(process.env.PORT || 3000);
console.log('~~~~ Server Running ~~~~');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client')));
app.get('/', (req, res) => {
    res.sendFile('index');
});

app.post('/login',function(req,res){
  var user_name=req.body.user;
  var password=req.body.password;
  firebase.database().ref('/users').orderByChild('username').equalTo(user_name).on("value", function(snapshot) {
    console.log(snapshot.val());
    snapshot.forEach(function(data) {
        console.log(data.key);
    });
});
  // firebase.database().ref('/users').orderByChild("username").equalTo(user_name).on('child_added', function(snapshot) {
  //       console.log("Customer Key:"+snapshot.key);
  //       if(snapshot.hasChild(user_name))
  //           res.end("Invalid");
  //       else
  //           res.end("Valid");
  //   });
  console.log("User name = "+user_name+", password is "+password);

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
