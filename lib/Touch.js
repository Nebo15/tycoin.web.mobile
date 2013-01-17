// Touch events
(function() {
  var isScrolling = false;

  $(window).bind('touchstart', function(e) {
    isScrolling = false;
  });

  $(window).bind('touchmove', function(e) {
    isScrolling = true;
  });

  $.fn.extend({
    tap: function(onTap) {
      if($.isMobile()) {
        this.bind('touchend', function(e) {
          if(!isScrolling) {
            e.preventDefault();
            onTap.call(this, e);
          }
        });
      } else {
        this.click(onTap);
      }
    }
  });
})();
