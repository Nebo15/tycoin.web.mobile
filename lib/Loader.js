var Loader = {
  speed: 100,

  show: function(message) {
    this.setStatus(message);
    $(".content").animate({opacity: 0}, this.speed, function() {
      $(".preloader").css('display', 'block');
      $(".preloader").animate({opacity: 1}, this.speed);
    });
  },

  hide: function() {
    $(".preloader").stop(true, true);
    $(".content").stop(true, true);
    $(".preloader").animate({opacity: 0}, this.speed, function() {
      $(".content").animate({opacity: 1}, this.speed, function() {
        $(".preloader").css('display', 'none');
      });
    });
  },

  setStatus: function(message) {
    if(message)
      console.log(message);
    else
      message = '';

    $(".preloader > p").text(message);
  }
};
