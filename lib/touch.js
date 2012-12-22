// Touch events
(function() {
  var isScrolling = false;

  $(window).bind('touchstart', function() {
    isScrolling = false;
  });

  $(window).bind('touchmove', function() {
    isScrolling = true;
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
