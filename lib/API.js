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
        console.log(response);
        alert(response.errors[0]);
        // setTimeout(function(){
        //   Navigation.redirectToDefaultPage();
        // }, 2000);
      });

      request.statusCode(0, function() {
        Loader.show('Internet connection is required for this application');
      });

      if (Storage.get('token')) {
        setRequestToken(request);
      }

      request.statusCode(401, function() {
        request.statusCode(401, function() {
          alert("Request needs authentication, but login failed!");
        });

        Loader.setStatus('Unauthorized access restricted');
        API.login(function() {
          Loader.setStatus('Sending request with new credetials');
          setRequestToken(request);
          request.send();
        });
      });

      request.statusCode(404, function() {
        alert('Page not found!');
      });

      return request;
    },

    getAccessToken_JS: function(onTokenRecieved) {
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
            console.log('Access Token = ' + token);
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
      window.location.href = 'http://' + Config.host + '/auth/mobile_facebook_login';
      window.handleOpenURL = function(url) {
        Loader.setStatus('Mobile auth succeeded');
        var token = url.substring(url.indexOf('=') + 1);
        Storage.set('token', token);
        onTokenRecieved(token);
      };
    },

    login: function(onLoginComplete) {
      Loader.setStatus('Logging in');
      var request = new Request('POST', '/auth/login');

      request.success(function(response) {
        Loader.setStatus('Logged in');
        Storage.set('user', response.data.result);

        $.event.trigger({
            type: 'login',
            user: response.data.result
        });

        onLoginComplete();
      });

      request.error(function() {
        request.error(function() {
          alert("Can't log in!");
        });

        Loader.setStatus('Login attempt failed');
        API.getAccessToken(doLogin);
      });

      var doLogin = function() {
        setRequestToken(request);
        request.send();
      };

      if (Storage.get('token')) {
        setRequestToken(request);
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
      Backend.SyncAjax('GET', '/auth/logout');
      Navigation.redirectToDefaultPage();
    }
  };
})();
