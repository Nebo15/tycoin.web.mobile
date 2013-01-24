var Backpane = (function() {
  // Handling touch
  var startTouchX;
  var startTouchY;
  var tolerance = 10;
  var direction = 'left';
  var shift;

  function getTransfromValue(target) {
    var obj = target.css("transform");
    return parseFloat((obj.substr(7, obj.length - 8).split(', '))[4]);
  }

  function getBackpaneTransformValue() {
    return getTransfromValue($('.content, .bar-title, .bar-tab'));
  }

  function setTransformValue(target, value) {
    return target.css("transform", "translate(" + value + "px, 0)");
  }

  function setBackpaneTransformValue(value) {
    return setTransformValue($('.content, .bar-title, .bar-tab'), value);
  }

  function getBackpaneWidth() {
    return $('.backPane').width();
  }

  $(window).bind('touchstart', function(e) {
    var touch = e.originalEvent.targetTouches[0];
    startTouchX = touch.pageX;
    startTouchY = touch.pageY;
    shift = 0;

    $('.content, .bar-title, .bar-tab').css("-webkit-transition", "-webkit-transform 0.02s linear");
    $('.content, .bar-title, .bar-tab').css("transition", "transform 0.02s linear");
  });

  $(window).bind('touchmove', function(e) {
    var touch = e.originalEvent.targetTouches[0];

    // Showing backpane on left swipe
    if(shift != 0 || Math.pow(touch.pageX - startTouchX, 2) - Math.pow(touch.pageY - startTouchY, 2) > Math.pow(tolerance, 2)) {
      e.preventDefault();
      shift = (touch.pageX - startTouchX);

      if(shift > 0) {
        direction = 'left';

        if(getBackpaneTransformValue() < getBackpaneWidth()) {
          setBackpaneTransformValue(shift);
        } else {
          setBackpaneTransformValue(getBackpaneWidth());
        }
      } else {
        direction = 'right';

        shift += getBackpaneWidth();

        if(shift > 0) {
          setBackpaneTransformValue(shift);
        } else {
          setBackpaneTransformValue(0);
        }
      }
    }
  });

  $(window).bind('touchend', function(e) {
    $('.content, .bar-title, .bar-tab').css("-webkit-transition", "-webkit-transform 0.8s ease");
    $('.content, .bar-title, .bar-tab').css("transition", "transform 0.8s ease");

    if(shift !== 0) {
      e.preventDefault();
      if(direction == 'right') {
        if(getBackpaneWidth()/10 > getBackpaneWidth()-shift) {
          Backpane.show();
        } else {
          Backpane.hide();
        }
      } else {
        if(getBackpaneWidth()/10 > shift) {
          Backpane.hide();
        } else {
          Backpane.show();
        }
      }
    }
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
    show: function()
    {
      setBackpaneTransformValue(getBackpaneWidth());

      $.event.trigger({
        type: 'backpaneShow'
      });
    },

    hide: function()
    {
      setBackpaneTransformValue(0);

      $.event.trigger({
        type: 'backpaneHide'
      });
    },

    toggle: function()
    {
      if(!getBackpaneTransformValue())
      {
        Backpane.show();
      }
      else
      {
        Backpane.hide();
      }
    },

    setBage: function(count)
    {
      var speed = 400;
      var bage  = $(".button#backpane > .count-negative");

      if(count != 0)
      {
        bage.animate({opacity: 1}, speed, function()
        {
          bage.html(count);
        });
      }
      else
      {
        $('.activities .count-negative').addClass('count').removeClass('count-negative');
        bage.animate({opacity: 0}, speed);
      }
    }
  };
})();
