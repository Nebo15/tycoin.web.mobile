var Backpane = (function() {
  // Handling touch
  var startTouchX;
  var startTouchY;
  var tolerance = 50;

  $(window).bind('touchstart', function(e) {
    startTouchX = e.originalEvent.targetTouches[0].pageX;
    startTouchY = e.originalEvent.targetTouches[0].pageY;
  });

  $(window).bind('touchmove', function(e) {
    var touch = e.originalEvent.targetTouches[0];

    // Showing backpane on left swipe
    if(Math.pow(touch.pageX - startTouchX, 2) - Math.pow(touch.pageY - startTouchY, 2) > Math.pow(tolerance, 2))
    {
      e.preventDefault();
      var shift = Math.abs(touch.pageX - startTouchX);

      if(touch.pageX < startTouchX) {
        if($('.backPane#left').hasClass('visible')) {
          // Swipe left
          console.log("Left swipe: " + shift);
          Backpane.hide('left');
        }
      } else if(!$('.backPane#left').hasClass('visible')) {
        // Swipe right
        Backpane.show('left');
        // if(shift < tolerance*4) {
        //   $('.bar-title, .content, .bar-tab').css('marginLeft', shift);
        // } else {
        //   $(document).one('backpaneShow', function() {
        //     $('.bar-title, .content, .bar-tab').css('marginLeft', 0);
        //   });
        // }

        console.log("Right swipe: " + shift);
      }
    }
  });

  // Handling buttons
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

  // Public methods
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
