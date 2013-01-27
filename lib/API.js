var API = (function() {
  function setRequestToken(request) {
    if(request.params.data === undefined)
      request.params.data = {};

    request.params.data.token = Storage.get('token');
  }

  return {
    request: function(method, path, data, params) {
      var request = new Request(method, path, data, params);

      request.statusCodeGroup(4, function(jqXHR, textStatus, errorThrown) {
        Loader.hide();
        var response = jQuery.parseJSON(jqXHR.responseText);
        console.log(responste);
        alert(response.errors[0]);
      });

      request.statusCode(0, function() {
        Navigation.redirectToPage('error');
      });

      if(Storage.get('token')) {
        setRequestToken(request);
      }

      request.statusCode(401, function() {
        Loader.setStatus('Unauthorized access restricted');
        App.ticker.pause();

        API.login(function() {
          Loader.setStatus('Sending request with new credetials');
          setRequestToken(request);
          request.send();
          App.ticker.unpause();
        }, function() {
          request.statusCode(401, function() {
            alert("Request needs authentication, but login failed!");
          });
        });
      });

      request.statusCode(404, function() {
        alert('Page not found!');
      });

      return request;
    },

    getAccessToken_JS: function(onTokenRecieved) {
      Loader.setStatus('Using browser auth');
      $.getScript('//connect.facebook.net/en_US/all.js').done(function() {
        FB.init({
          appId: '414778518590747',
          status: true,
          cookie: true,
          xfbml : false
        });

        localStorage.clear();

        Loader.setStatus('Logging in Facebook');
        FB.login(function(response) {
          Loader.setStatus('Getting access token');
          if (response.authResponse) {
            var token = response.authResponse['accessToken'];
            Loader.setStatus('Token recieved: ' + token);
            Storage.set('token', token);
            return onTokenRecieved(token);
          } else {
            alert('User cancelled login or did not fully authorize.');
          }
        });
      });
    },

    getAccessToken: function(onTokenRecieved) {
      if(!$.isMobile()) {
        return this.getAccessToken_JS(onTokenRecieved);
      }

      Loader.setStatus('Using mobile auth');
      Storage.clear();
      var ref = window.open('http://' + Config.host + '/auth/mobile_facebook_login', '_blank', 'location=no');

      window.handleOpenURL = function(url) {
        ref.close();
        Loader.setStatus('Mobile auth succeeded');
        var token = url.substring(url.indexOf('=') + 1);
        Loader.setStatus('Token recieved: ' + token);
        Storage.set('token', token);
        onTokenRecieved(token);
      };
    },

    login: function(onLoginComplete, onLoginFail) {
      Loader.setStatus('Logging in');
      var login_request = new Request('POST', 'auth/login', {async:false});

      login_request.success(function(response) {
        Loader.setStatus('Logged in');
        Storage.set('user', response.data.result);

        $.event.trigger({
            type: 'login',
            user: response.data.result
        });

        onLoginComplete();
      }, true);

      login_request.error(function() {
        login_request.error(onLoginFail, true);

        Loader.setStatus('Login attempt failed');
        API.getAccessToken(doLogin);
      }, true);

      var doLogin = function() {
        setRequestToken(login_request);
        login_request.send();
      };

      if (Storage.get('token')) {
        setRequestToken(login_request);
        doLogin();
      } else {
        console.log('Access token not set');
        API.getAccessToken(doLogin);
      }
    },

    logout: function() {
      console.log('Logging out');
      console.log('Dropping LocalStorage cache');
      Storage.clear();
      var logout_request = new Request('GET', 'auth/logout', {async:false});
      logout_request.send();
      Navigation.redirectToDefaultPage();
    }
  };
})();
