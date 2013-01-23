var Loader = {
  speed: 100,

  show: function(message) {
    this.setStatus(message);
    $('.backPane').css('display', 'none');
    $(".content, .bar-title").animate({opacity: 0}, this.speed, function() {
      $(".preloader").css('display', 'block');
      $(".preloader").animate({opacity: 1}, this.speed);
    });
  },

  hide: function() {
    $(".preloader").stop(true, true);
    $(".content, .bar-title").stop(true, true);
    $(".preloader").animate({opacity: 0}, this.speed, function() {
      $(".content, .bar-title").animate({opacity: 1}, this.speed, function() {
        $(".preloader").css('display', 'none');
        $('.backPane').css('display', 'block');
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
