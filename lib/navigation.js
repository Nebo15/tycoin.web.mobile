var Navigation = {
  history: [],
  params:  [],

  init: function() {
    // When hash changed we change page
    $(window).bind('hashchange', Navigation.redirectToPageInHash);

    // Init footer menu
    $('.tab-inner > .tab-item').tap(function() {
      $('ul.tab-inner > li.tab-item.active').removeClass('active');
      $(this).addClass('active');
      Navigation.redirectToPage($(this).attr("page"));
    });

    $(document).bind('pageRender', function() {
      // Init Back button
      $("a.button-prev").tap(function() {
        Navigation.redirectToPreviousPage();
      });

      // Init segmented-controller buttons
      $('ul.segmented-controller > li').tap(function() {
        Navigation.redirectToPage($(this).find('a').attr("href"));
      });

      // Scroll to top on page render
      $("html, body, .content").animate({ scrollTop: 0 }, 0);
    });

    // Open page saved in hash or default page
    if(!Storage.get('skip_intro')) {
      Navigation.redirectToPage('intro');
    } else if(window.location.hash) {
      Navigation.redirectToPageInHash();
    } else {
      Navigation.redirectToDefaultPage();
    }
  },

  redirectToPage: function(page) {
    window.location.hash = page;
  },

  redirectToDefaultPage: function() {
    Navigation.redirectToPage('send');
  },

  redirectToPreviousPage: function() {
    if(Navigation.history.length > 2) {
      var previous_name = Navigation.history[Navigation.history.length - 2];
      console.log('Going back to ' + previous_name);
      Navigation.redirectToPage(previous_name);
      $(document).one('pageRender', function() {
        Navigation.history.shift();
      });
    } else {
      alert('History is empty');
    }
  },

  redirectToPageInHash: function() {
    var name               = window.location.hash.substring(1);
    params = [];
    var params_start_index = name.indexOf(':');

    // History shoud be saved with params
    Navigation.history.push(name);

    // Parsing params
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

    Page.load(name);
  },

  getParams: function() {
    return params;
  },

  getParam: function(name) {
    return params[name];
  }
};
