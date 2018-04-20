    $(function () {
      var socket = io.connect();
      var $messageForm = $('#messageForm');
      var $message = $('#message');
      var $chat = $('#chat');
      var $userForm = $('#userForm');
      var $registerForm = $('#registerForm');
      var $userFormArea = $('#userFormArea');
      var $messageArea = $('#messageArea');
      var $users = $('#users');
      var $lusername = $('#lusername');
      var $lpassword = $('#lpassword');
      var $rusername = $('#rusername');
      var $rpassword = $('#rpassword');
      var $info = $('#info');

      $messageForm.submit((e) => {
        e.preventDefault();
        socket.emit('send message', $message.val());
        $message.val('');
      });

      socket.on('new message', (data) => {
        $chat.append(
          `<div class="card card-block bg-light p-1 my-1"><b>${data.user}:</b> ${data.msg}</div>`);
      });

      $userForm.submit((e) => {
        e.preventDefault();
        var user = {
          username: $lusername.val().trim(),
          password: $lpassword.val().trim(),
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
        socket.emit('register user', user, (data) => {
          if (data) {
            window.alert("Registration Successful!");
          } else {
            window.alert("Registration Failed!");
          }
        });
        $rusername.val('');
        $rpassword.val('');
      });

      socket.on('get users', (data) => {
        var html = '';
        for (i = 0; i < data.length; i++) {
          html += '<li class="list-group-item">' + data[i] + '</li>';
        }
        $users.html(html);
      });

      socket.on('info', (package) => {
        var html = `Build: v${package.version}`;
        $info.html(html);
      });
    });
