var Navigation = {
  history: [],

  onLoad: function() {
    // When hash changed we change page
    $(window).bind('hashchange', Navigation.redirectToPageInHash);

    $("#logout").tap(function() {
      if(confirm('Do you really want to log out?')) {
        API.logout();
      }
    });

    $(document).bind('pageRender', function() {
      // Init Back button
      $("a.button-prev").tap(function() {
        Navigation.redirectToPreviousPage();
      });

      // Scroll to top on page render
      $("html, body, .content").animate({ scrollTop: 0 }, 0);
    });

    // Open page saved in hash or default page
    if(window.location.hash) {
      Navigation.redirectToPageInHash();
    } else {
      Navigation.redirectToDefaultPage();
    }
  },

  redirectToPage: function(page) {
    window.location.hash = page;
  },

  redirectToDefaultPage: function() {
    Navigation.redirectToPage('give');
  },

  redirectToPreviousPage: function() {
    if(Navigation.history.length > 1) {
      var previous_name = Navigation.history[Navigation.history.length - 2];
      console.log('Going back to ' + previous_name);
      Navigation.redirectToPage(previous_name);
      Navigation.history.pop();
      // Dont add element again
      $(document).one('pageLoad', function() {
        Navigation.history.pop();
      });
    } else {
      alert('History is empty');
    }
  },

  redirectToPageInHash: function() {
    var name = window.location.hash.substring(1);

    // History shoud be saved with params
    Navigation.history.push(name);

    $.event.trigger({
        type: 'pageLoad'
    });
  },

  getLocation: function() {
    return window.location.hash.substring(1);
  },

  setMenuActivePage: function(name) {
    $('.tab-item[page!='+name+']').removeClass('active');
    $('.tab-item[page='+name+']').addClass('active');
  }
};
