'use strict';
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const path = require('path');
const info = require('./package.json');
const firebase = require('firebase');
var users = [];
var connections = [];

server.listen(process.env.PORT || 3000);
console.log('~~~~ Server Running on port 3000');
console.log(`~~~~ Test Build ${info.version}`)


app.use(express.static(path.join(__dirname, 'client')));
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + "/client/admin.html");
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
var admin_ref = firebase.database().ref('/admins');



// Socket Initialize
io.sockets.on('connection', (socket) => {
  socket.emit('info', info);
  connections.push(socket);
  console.log('Connected: %s Sockets Connected', connections.length);
  updateRegisteredUsers();
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

  socket.on('login user', (data, callback) => {
    console.log(data);
    var username = data.username;
    var password = data.password;
    ref.orderByChild('username').equalTo(username).on("value", function(snapshot) {
      snapshot.forEach((data) => {
        var key = data.key;
        var _users = firebase.database().ref('/users/' + key);
        _users.on('value', function(snapshot) {
          var _user = snapshot.val();
          var _username = _user.username;
          var _password = _user.password;
          if (username == _username && password == _password) {
            socket.username = _username;
            users.push(socket.username);
            callback(true);
            updateUserNames();
            console.log("right user");
          } else {
            callback(false);
            console.log("wrong user");
          }
        });
      });
    });
  });

  socket.on('register user', (user) => {
    console.log(user);
    var temp = 1;
    ref.orderByChild('username').equalTo(user.username).once("value", function(snapshot) {
      temp = snapshot.numChildren();
      console.log(temp);
      if (temp == 0) {
        ref.push(user);
        console.log("user added");
        socket.emit('register response', true);
      } else {
        console.log("user already exists");
        socket.emit('register response', false);
      }
    });
  });

  socket.on('update password', (data, callback) => {
    console.log(data);
    var username = data.username;
    var password = data.password;
    ref.orderByChild('username').equalTo(username).on("value", function(snapshot) {
      var temp = snapshot.numChildren();
      if (temp == 0) {
        callback(false);
        console.log("No Such User");
      } else {
        snapshot.forEach((data) => {
          var key = data.key;
          var _users = firebase.database().ref('/users/' + key);
          _users.on('value', function(snapshot) {
            var _user = snapshot.val();
            var _username = _user.username;
            var _password = _user.password;
            var path = "/users/"+key+"/password"
            if (username == _username) {
              //set data
              _users.set({
                'username' : username,
                'password' : password
              });
              callback(true);
              console.log("Password Updated");
            } else {
              callback(false);
              console.log("Password update failed");
            }
          });
        });
      }
    });
  });

  socket.on('delete user', (data, callback) => {
    console.log(data);
    var username = data;
    ref.orderByChild('username').equalTo(username).on("value", function(snapshot) {
      var temp = snapshot.numChildren();
      var flag = 1;
        snapshot.forEach((data) => {
          var key = data.key;
          var _users = firebase.database().ref('/users/' + key);
          _users.on('value', function(snapshot) {
            var _user = snapshot.val();
            try{
              var _username = _user.username;
              var _password = _user.password;
              if (username == _username) {
                //set data
                _users.remove();
                updateRegisteredUsers();
                flag = 0;
                callback(true);
                console.log("Deleted!");
              }
            }
            catch (Exception)
            {

            }
          });
        });
        if(flag == 1)
        {
          updateRegisteredUsers();
        }
    });
  });

  socket.on('admin login', (data, callback) => {
    console.log(data);
    var username = data.username;
    var password = data.password;
    admin_ref.orderByChild('username').equalTo(username).on("value", function(snapshot) {
      var temp = snapshot.numChildren();
      if (temp == 0) {
        callback(false);
        console.log("No Such User");
      } else {
        snapshot.forEach((data) => {
          var key = data.key;
          var _users = firebase.database().ref('/admins/' + key);
          _users.on('value', function(snapshot) {
            var _user = snapshot.val();
            var _username = _user.username;
            var _password = _user.password;
            if (username == _username && password == _password) {
              socket.username = "Admin: " + _username;
              callback(true);
              console.log("Hello Admin");
            } else {
              callback(false);
              console.log("Wrong Credentials");
            }
          });
        });
      }
    });
  });

  function updateRegisteredUsers() {
    firebase.database().ref().child("users").on("value", function(snapshot) {
      var count = snapshot.numChildren();
      var res = {
        count: count
      };
      socket.emit('count users', res);
    });
  }

  function updateUserNames() {
    io.sockets.emit('get users', users);
  }
});
