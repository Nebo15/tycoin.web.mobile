// Touch events
(function() {
  var isScrolling = false;

  $(window).bind('touchstart', function() {
    isScrolling = false;
    console.log('touchstart');
  });

  $(window).bind('touchmove', function(e) {
    isScrolling = true;
    console.log('touchmove');
    console.log(e.originalEvent.targetTouches);
  });

  $(window).bind('touchcancel', function() {
    console.log('touchcancel'); // The user's finger wanders into browser UI
  });

  $(window).bind('touchend', function() {
    console.log('touchend'); // End of touch
  });

  $.fn.extend({
    tap: function(onTap) {
      if($.browser.chrome) {
        this.click(onTap);
      } else {
        this.bind('touchend', function(e) {
          if(!isScrolling)
            onTap.call(this, e);
        });
      }
    }
  });
})();
