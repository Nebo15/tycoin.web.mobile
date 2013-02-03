var Backpane = (function() {
  var _width;
  var transformable;

  // Helper methods
  function getTransfromValue(target) {
    var obj = target.css("transform");
    return parseFloat((obj.substr(7, obj.length - 8).split(', '))[4]);
  }

  function getBackpaneTransformValue() {
    return getTransfromValue(transformable);
  }

  function setTransformValue(target, value) {
    return target.css("transform", "translate(" + value + "px, 0)");
  }

  function setBackpaneTransformValue(value) {
    return setTransformValue(transformable, value);
  }

  function getBackpaneWidth() {
    if(_width === undefined)
      _width = $('.backPane').width();

    return _width;
  }

  $(window).load(function() {
    transformable = $('.content, .bar-title, .bar-tab');

    // Handling touch
    var swipeDetected = false;
    var startTouchX;
    var startTouchY;
    var startBackpaneTransformValue;

    var shift;

    // Animation config
    var tolerance = 10;

    // Touch events
    $(window).bind('touchstart', function(e) {
      var touch = e.originalEvent.targetTouches[0];
      startTouchX = touch.pageX;
      startTouchY = touch.pageY;
      startBackpaneTransformValue = getBackpaneTransformValue();
      swipeDetected = false;
    });

    $(window).bind('touchmove', function(e) {
      var touch = e.originalEvent.targetTouches[0];

      if(!swipeDetected && Math.pow(touch.pageX - startTouchX, 2) - Math.pow(touch.pageY - startTouchY, 2) > Math.pow(tolerance, 2)) {
        swipeDetected = true;

        transformable.css("-webkit-transition", "-webkit-transform 0.02s linear")
                     .css("transition", "transform 0.02s linear");
      }

      // Showing backpane on left swipe
      if(swipeDetected) {
        e.preventDefault();

        var prev_shift = shift;
        shift = (touch.pageX - startTouchX);

        if(Math.abs(shift) < Math.abs(prev_shift)) {
          startTouchX = touch.pageX;
          startTouchY = touch.pageY;
          startBackpaneTransformValue = getBackpaneTransformValue();
          shift = (touch.pageX - startTouchX);
        }

        var abs_shift = startBackpaneTransformValue + shift;

        if(0 < abs_shift && abs_shift < getBackpaneWidth()) {
          setBackpaneTransformValue(startBackpaneTransformValue + shift);
        }
      }
    });

    $(window).bind('touchend touchleave', function(e) {
      if(swipeDetected) {
        transformable.css("-webkit-transition", "-webkit-transform 0.8s ease")
                     .css("transition", "transform 0.8s ease");

        e.preventDefault();

        if(getBackpaneWidth()/10 > shift) {
          Backpane.hide();
        } else {
          Backpane.show();
        }
      }
    });
  });

  $(window).load(function() {
    $('.backPane a').click(Backpane.hide);
  });

  $(document).bind('pageLoad', function() {
    Backpane.hide();
  });

  // Handling buttons
  $(document).bind('pageRender', function() {
    $(".button#backpane").tap(function() {
      Backpane.toggle();
    });

    // Re-init bage
    Backpane.setBage($(".button#backpane > .count-negative").html());
  });

  // Public methods
  return {
    show: function() {
      setBackpaneTransformValue(getBackpaneWidth());

      $.event.trigger({
        type: 'backpaneShow'
      });
    },

    hide: function() {
      setBackpaneTransformValue(0);

      $.event.trigger({
        type: 'backpaneHide'
      });
    },

    toggle: function() {
      if(!getBackpaneTransformValue()) {
        Backpane.show();
      } else {
        Backpane.hide();
      }
    },

    setBage: function(count) {
      var speed = 400;
      var bage  = $(".button#backpane > .count-negative");

      if(count != 0) {
        bage.animate({opacity: 1}, speed, function() {
          bage.html(count);
        });
      } else {
        $('.activities .count-negative').addClass('count').removeClass('count-negative');
        bage.animate({opacity: 0}, speed);
      }
    }
  };
})();
