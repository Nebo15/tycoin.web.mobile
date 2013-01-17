var App = {};

// Global helpers
(function() {
  String.prototype.hashCode = function() {
    var hash = 0, i, char;

    if (this.length === 0) return hash;

    for (i = 0; i < this.length; i++) {
      char = this.charCodeAt(i);
      hash = ((hash<<5)-hash)+char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return hash;
  };

  $.isMobile = function() {
    var userAgent = window.navigator.userAgent;

    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
      return true;
    } else {
      return false;
    }
  };

})();

// Ticker
(function() {
  var subscribers = [];

  // Ticking function
  var ticker = function() {
    App.ticker.tick();
    setTimeout(ticker, 5000);
  };
  setTimeout(ticker, 5000);

  App.ticker = {
    subscribe: function(callback) {
      subscribers.push(callback);
    },

    tick: function() {
      $.each(subscribers, function(index, callback) {
        callback();
      });
    }
  };
})();

// Balance
(function() {
  var data;

  App.balance = {
    load: function(callback) {
      return API.request('GET', '/my/balance')
        .success(function(response) {
          data = response.data.result;

          data.coins_to_send     = data.free_coins_count + data.purchased_big_coins_count + data.purchased_coins_count;
          data.coins_to_exchange = data.received_coins_count + data.received_big_coins_count;

          data.usual_coins_to_send = data.free_coins_count + data.purchased_coins_count;
          data.big_coins_to_send   = data.purchased_big_coins_count;

          data.free_coins_available_time_pretty = Tools.prettyDate(data.free_coins_available_time * 1000);

          callback(data);
        })
        .send();
    },

    get: function(callback) {
      if(data) {
        return callback(data);
      } else {
        return this.load(callback);
      }
    },

    update: function(callback) {
      return this.get(function(balance) {
        $('.coins-counts[type=give] .coin-usual').html(balance.usual_coins_to_send);
        $('.coins-counts[type=give] .coin-big').html(balance.big_coins_to_send);
        $('.coins-counts[type=exchange] .coin-usual').html(balance.received_coins_count);
        $('.coins-counts[type=exchange] .coin-big').html(balance.received_big_coins_count);

        if(callback)
          return callback(balance);
      });
    }
  };
})();

// Activities
(function() {
  var data;
  var utime;
  var expiration_time = 10000;
  var template = Template.loadSubtemplate('activity');
  var bage_count;
  var update_request;

  // Backpane integration
  $(document).bind('backpaneHide', function() {
    bage_count = 0;
  });

  $(document).bind('backpaneShow', function() {
    bage_count = 0;
    App.activities.update();
  });

  $(document).bind('pageRender', function() {
    Backpane.setBage(bage_count);
  });

  // Button bindings
  $(window).load(function() {
    $('.activities span.icon-refresh').tap(function() {
      if(!this.hasClass('icon-spin')) {
        utime = undefined;
        App.activities.update();
      }
    });
  });

  // Shorten name
  function cutName(name) {
    var tmp = name.split(' ');
    return tmp[0] + ' ' + tmp[1].substring(0, 1) + '.';
  }

  App.activities = {
    load: function(callback) {
      $('.activities span.icon-refresh').addClass('icon-spin');

      return API.request('GET', '/transaction/history', {limit:15})
        .success(function(response) {
          utime = new Date().getTime();
          data  = response.data.result;

          var current_user = Storage.get('user');
          $.each(data, function(index, value) {
            data[index].time = Tools.prettyDateShort(value.time * 1000);

            if(data[index].recipient)
              data[index].recipient.name = cutName(data[index].recipient.name);
            if(data[index].sender)
              data[index].sender.name = cutName(data[index].sender.name);

            if(value.recipient_id == current_user.id) {
              data[index].subtype = '+';
            } else {
              data[index].subtype = '-';
            }
          });

          $('.activities span.icon-refresh').removeClass('icon-spin');

          return callback(data);
        })
        .send();
    },

    get: function(callback) {
     if(utime + expiration_time < new Date().getTime()) {
        data = undefined;
      }

      if(data) {
        return callback(data);
      } else {
        return this.load(callback);
      }
    },

    update: function(callback) {
      return this.get(function(activities) {
        $(".activities li").not(".list-divider").remove();

        var html = '';
        $.each(activities, function(index, value) {
          html += Template.compileElement(template, value);
        });
        $('.activities .list-divider').after(html);

        if(callback)
          return callback(activities);
      });
    }
  };
})();

// var i = 0;
// var addIterated = function() {
//   var tmp = update.pop();
//   if(tmp) {
//     var html = Template.compileElement(activity_tpl, tmp);
//     $(html).insertAfter($('.activities .list-divider'));
//     i++;
//     setTimeout(addIterated, 500);
//   }
// };

// addIterated();
