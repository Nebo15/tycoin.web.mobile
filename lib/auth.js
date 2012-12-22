var Auth = {
    getAccessToken: function(onTokenRecieved) {
        localStorage.clear();
        Loader.setStatus('Logging in Facebook');
        window.location.href = 'http://stage.onedayofmine.com/auth/mobile_facebook_login';
        window.handleOpenURL = function(url) {
          var token = url.substring(url.indexOf('=')+1);
          localStorage.token = token;
          onTokenRecieved(token);
        };
    }
};
