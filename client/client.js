
  $(function () {
      var socket = io.connect();
      var $info = $('#info');
      var $message = $('#message');
      var $countUsers = $('#countUsers');
      var $countOnline = $('#countOnline');
      var $chat = $('#chat');
      var $users = $('#users');
      var $userForm = $('#userForm');
      var $adminForm = $('#adminForm');
      var $messageForm = $('#messageForm');
      var $registerForm = $('#registerForm');
      var $userFormArea = $('#userFormArea');
      var $adminFormArea = $('#adminFormArea');
      var $messageArea = $('#messageArea');
      var $toolArea = $('#toolArea');
      var $lusername = $('#lusername');
      var $lpassword = $('#lpassword');
      var $rusername = $('#rusername');
      var $rpassword = $('#rpassword');
      var $ausername = $('#ausername');
      var $apassword = $('#apassword');

  $messageForm.submit((e) => {
    e.preventDefault();
    socket.emit('send message', $message.val());
    $message.val('');
  });

  socket.on('new message', (data) => {
    $chat.append(
      `<div class="card card-block bg-light p-1 my-1"><b>${data.user}:</b> ${data.msg}</div>`);
  });


      $adminForm.submit((e) => {
        e.preventDefault();
        var user = {
          username: $ausername.val(),
          password: $apassword.val(),
        }
        socket.emit('admin login', user, (data) => {
          if (data) {
            $adminFormArea.addClass(' d-none');
            $toolArea.removeClass(' d-none');
            window.alert("Hello " + user.username);
          } else {
            window.alert("Wrong User");
          }
        });
        $ausername.val('');
        $apassword.val('');
      });

      $userForm.submit((e) => {
        e.preventDefault();
        var user = {
          username: $lusername.val(),
          password: $lpassword.val(),
        }
        socket.emit('login user', user, (data) => {
          if (data) {
            $userFormArea.addClass(' d-none');
            $messageArea.removeClass(' d-none');
          } else {
            window.alert("Wrong User");
          }
        });
        $lusername.val('');
        $lpassword.val('');
      });

  $registerForm.submit((e) => {
    e.preventDefault();
    var user = {
      username: $rusername.val().trim(),
      password: $rpassword.val().trim(),
    }
    $rusername.val('');
    $rpassword.val('');
    socket.emit('register user', user);
  });


  socket.on('register response', (data) => {
    if (data) {
      window.alert("Registration Successful!");
    } else {
      window.alert("Registration Failed! Try with different username");
    }
  });

      socket.on('get users', (data) => {
        var html = '';
        for (i = 0; i < data.length; i++) {
          html += '<li class="list-group-item">' + data[i] + '</li>';
        }
        $countOnline.html(data.length);
        $users.html(html);
      });

      socket.on('count users', (data) => {
        $countUsers.html(data);
      });

      socket.on('info', (package) => {
        var html = `Build: v${package.version}`;
        $info.html(html);
      });
    });