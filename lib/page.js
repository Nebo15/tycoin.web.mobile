var Page = (function() {
  // Parsing params
  function routePage(name) {
    var params = [];
    var params_start_index = name.indexOf(':');

    if(params_start_index !== -1)
    {
      var params_string = name.substring(params_start_index+1);
      var tmp = params_string.split('&');
      $(tmp).each(function(index, param) {
        var kv = param.split('=');
        params[kv[0]] = kv[1];
      });

      name = name.substring(0, params_start_index);
    }

    return {
      name:   name,
      params: params
    };
  }

  // Load page when event triggered
  $(document).bind('pageLoad', function() {
    Page.load(Navigation.getLocation());
  });

  // Show/Hide loader
  $(document).bind('pageRender', function() {
    Loader.hide();
  });

  $(document).bind('pageLoad', function() {
    Loader.show("");
  });

  var route;
  return {
    load: function(name) {
      route = routePage(name);

      console.log('Loading page "' + route.name + '"');
      // console.log(route.params);

      Template.load(route.name);
    },

    refresh: function() {
      Page.load(Navigation.getLocation());
    },

    getParams: function() {
      return route.params;
    },

    getParam: function(key) {
      return route.params[key];
    },

    getName: function() {
      return route.name;
    }
  };
})();
