var Auth = {
    getAccessToken: function(onTokenRecieved) {
        localStorage.clear();
        Loader.setStatus('Logging in Facebook');
        window.location.href = Backend.Host + '/auth/mobile_facebook_login';
        window.handleOpenURL = function(url) {
          var token = url.substring(url.indexOf('=') + 1);
          Loader.setStatus('Recieved token from FB (protocol method)');
          localStorage.token = token;
          onTokenRecieved(token);
        };
    }
};
