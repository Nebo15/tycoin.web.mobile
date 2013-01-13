var Tools = {
  resetToggle: function(toggle, active) {
    var handle = toggle.find('.toggle-handle');
    if(active === true) {
      toggle.addClass('active');
      handle.css('-webkit-transform', 'translate3d(47px,0,0)');
    } else {
      toggle.removeClass('active');
      handle.css('-webkit-transform', 'translate3d(0,0,0)');
    }
  },

  getISODate: function() {
    var date = new Date();

    var pad = function(number, length) {
        var str = "" + number;
        while (str.length < length) {
            str = '0'+str;
        }
        return str;
    };

    var timezone_offset = date.getTimezoneOffset();
    var offset = ((timezone_offset < 0 ? '+':'-') + // Note the reversed sign!
                  pad(parseInt(Math.abs(timezone_offset/60)), 2) + ':' +
                  pad(Math.abs(timezone_offset%60), 2));

    return date.getUTCFullYear() + '-' + pad(date.getUTCMonth()+1, 2) + '-' +  date.getUTCDate()  +
     'T' + date.getUTCHours() + ':' + date.getUTCMinutes()+ ':' + date.getUTCSeconds() + offset;
  },

  // TODO: add future dates
  prettyDate: function(time){
    var date = new Date(time),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);

    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
      return;

    return day_diff == 0 && (
        diff < 60 && "just now" ||
            diff < 120 && "1 minute ago" ||
            diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
            diff < 7200 && "1 hour ago" ||
            diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
        day_diff == 1 && "Yesterday" ||
        day_diff < 7 && day_diff + " days ago" ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
  },
  
  prettyDateShort: function(time){
    var date = new Date(time),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);

    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
      return;

    return day_diff == 0 && (
        diff < 60 && "now" ||
            diff < 120 && "1 min" ||
            diff < 3600 && Math.floor( diff / 60 ) + " min" ||
            diff < 7200 && "1 hour" ||
            diff < 86400 && Math.floor( diff / 3600 ) + " hours") ||
        day_diff == 1 && "1 day" ||
        day_diff < 7 && day_diff + " days" ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + " week";
  }

};
