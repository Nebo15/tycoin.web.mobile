var Backpane = (function() {
  $(document).bind('pageRender', function() {
    $(".button[backpane-id]").tap(function() {
      Backpane.toggle($(this).attr('backpane-id'));
    });

    // Re-init bage
    Backpane.setBage($(".button[backpane-id] > .count-negative").html());
  });

  $(document).bind('pageLoad', function() {
    Backpane.hide();
  });

  return {
    show: function(id) {
      $('.backPane#' + id).addClass('visible');
      $('body').addClass('openPaneLeft');

      $.event.trigger({
        type: 'backpaneShow'
      });
    },

    hide: function() {
      $('.backPane').removeClass('visible');
      $('body').removeClass('openPaneLeft openPaneRight');

      $.event.trigger({
        type: 'backpaneHide'
      });
    },

    toggle: function(id) {
      if($('.backPane#' + id).hasClass('visible')) {
        Backpane.hide();
      } else {
        Backpane.show(id);
      }
    },

    setBage: function(count) {
      var speed = 400;
      var bage  = $(".button[backpane-id] > .count-negative");

      if(count == 0) {
        bage.animate({opacity: 0}, speed);
      } else {
        bage.animate({opacity: 1}, speed, function() {
          bage.html(count);
        });
      }
    }
  };
})();
