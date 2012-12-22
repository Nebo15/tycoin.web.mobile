// Methods to work with API
var Backend = {
  Host: 'http://stage.onedayofmine.com/',

  SyncAjax: function(method, path, data, params) {
    if (typeof localStorage.token == "string") {
      data = $.extend(data, {token:localStorage.token});
    }

    return $.ajax($.extend({
      type:   method.toUpperCase() == 'POST' ? 'POST' : 'GET',
      url:    Backend.Host + path,
      dataType: 'json',
      data:   data,
      cache:  false
    }, params));
  },

  Request: function(method, path, data) {
    var def = new $.Deferred();

    var status_codes = {
      200: function() {
        console.log('Request completed');
      },

      404: function() {
        alert('Page not found');
        def.reject();
      },

      401: function() {
        alert('Server needs authorization, but auto-login failed');
        def.reject();
      }
    };

    var params = {
      statusCode: status_codes
    };

    var overrided_params = {
      statusCode: $.extend({}, status_codes, {
        401: function() {
          Loader.setStatus('Server needs authorization');
          return Backend.Login(function() {
            Loader.setStatus('Re-trying request');
            Backend.SyncAjax(method, path, data, params).done(function(data, a) {
              def.resolve(data, a);
            });
          });
        }
      })
    };

    this.SyncAjax(method, path, data, overrided_params).done(function(data, a) {
      def.resolve(data, a);
    });

    return def;
  },

  PostRequest: function(path, data) {
    return this.Request('POST', path, data);
  },

  GetRequest: function(path, data) {
    return this.Request('GET', path, data);
  },

  Login: function(onSuccessfulLogin) {
    Loader.setStatus('Logging in');

    var onLogin = function(login_data) {
      Loader.setStatus('Logged in');
      Storage.set('user', login_data.result);

      Loader.setStatus('Getting current day');
      Backend.SyncAjax('GET', '/days/current').done(function (current_day) {
        console.log('Current day set: ' + current_day.result.id);
        Storage.set('current_day', current_day.result);
      });

      return onSuccessfulLogin();
    };

    var onError = function() {
      Loader.setStatus('Login attempt failed');
      console.log('Logging in with new token');
      Auth.getAccessToken(requestLogin);
    };

    var attemptsLimit = 2;
    var requestLogin = function(token) {
      if(attemptsLimit <= 0) {
        alert('Can not log in, attempts limit exhausted');
      } else {
        attemptsLimit--;
      }

      Loader.setStatus('Sending credetials to backend');
      console.log('Using token = ' + token);

      var req = Backend.SyncAjax('POST', '/auth/login', {token: token});
      req.done(onLogin);
      req.fail(onError);
    };

    if (typeof localStorage.token == "string") {
      requestLogin(localStorage.token);
    } else {
      console.log('FB Access Token is invalid or not set');
      Auth.getAccessToken(requestLogin);
    }
  },

  Logout: function(callback) {
    console.log('Logging out');
    console.log('Dropping LocalStorage cache');
    localStorage.clear();
    Navigation.redirectToDefaultPage();
  },

  getCurrentUser: function() {
    return JSON.parse(localStorage.user);
  }
};
