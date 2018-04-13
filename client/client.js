    $(function () {
      var socket = io.connect();
      var $messageForm = $('#messageForm');
      var $message = $('#message');
      var $chat = $('#chat');
      var $userForm = $('#userForm');
      var $userFormArea = $('#userFormArea');
      var $messageArea = $('#messageArea');
      var $users = $('#users');
      var $username = $('#username');
      var $info=$('#info');
      $messageArea.addClass(' d-none');

      $messageForm.submit((e) => {
        e.preventDefault();
        socket.emit('send message', $message.val());
        $message.val('');
      });

      socket.on('new message', (data) => {
        $chat.append(
          `<div class="card card-block bg-light p-1 my-1"><b>${data.user}:</b> ${data.msg}</div>`);
      });

      // $userForm.submit((e) => {
      //   e.preventDefault();
      //   socket.emit('new user', $username.val(), (data) => {
      //     if (data) {
      //       $userFormArea.addClass(' d-none');
      //       $messageArea.removeClass(' d-none');
      //     }
      //   });
      //   $username.val('');
      // });

      socket.on('get users', (data) => {
        var html = '';
        for (i = 0; i < data.length; i++) {
          html += '<li class="list-group-item">' + data[i] + '</li>';
        }
        $users.html(html);
      });

      socket.on('info', (package)=>{
        var html = `Build: v${package.version}`;
        $info.html(html);
      });
    });
