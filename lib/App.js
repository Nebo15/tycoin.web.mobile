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
  var paused = false;

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
      if(!paused) {
        $.each(subscribers, function(index, callback) {
          callback();
        });
      }
    },

    pause: function() {
      paused = true;
    },

    unpause: function() {
      paused = false;
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
  var response;
  var expiration_time = 20000;
  var template = Template.loadSubtemplate('activity');
  var bage_count;
  var update_request;
  var pull_up_active = false;
  var pull_up_end_reached = false;

  // Backpane integration
  $(document).bind('backpaneHide', function() {
    bage_count = 0;
    Backpane.setBage(bage_count);
  });

  $(document).bind('backpaneShow', function() {
    bage_count = 0;
    updateNew();
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

    $('.backPane').scroll(function(e) {
      var _this = $(this);
      var scrollBottom = _this.outerHeight() - _this[0].scrollHeight + _this.scrollTop();

      if(!pull_up_end_reached && !pull_up_active && scrollBottom >= -30) {
        pull_up_active = true;
        updateOld();
      }
    });
  });

  // Formatting helpers
  function cutName(name) {
    var tmp = name.split(' ');
    return tmp[0] + ' ' + tmp[1].substring(0, 1) + '.';
  }

  function formatActivities(activities, mark_new) {
    var current_user = Storage.get('user');

    for (var i = 0, l = activities.length; i < l; i++) {
      activities[i].time = Tools.prettyDateShort(activities[i].time * 1000);

      if(activities[i].recipient)
        activities[i].recipient.name = cutName(activities[i].recipient.name);
      if(activities[i].sender)
        activities[i].sender.name = cutName(activities[i].sender.name);

      if(mark_new)
        activities[i].updated = true;

      if(activities[i].recipient_id == current_user.id) {
        activities[i].subtype = '+';
      } else {
        activities[i].subtype = '-';
      }
    }
  }

  function insertNew(delta) {
    var html = '';
    for (var i = 0, l = delta.length; i < l; i++) {
      html += Template.compileElement(template, delta[i]);
    }
    $('.activities .list-divider').after(html);

    $('.activities li').fadeIn();
  }

  function insertOld(delta) {
    var html = '';
    for (var i = 0, l = delta.length; i < l; i++) {
      html += Template.compileElement(template, delta[i]);
    }
    $('.activities li:last-child').after(html);

    $('.activities li').fadeIn();

    pull_up_active = false;
  }

  // Data updaters
  function updateNew() {
    if(!response) {
      App.activities.update();
    } else {
      if(response.timestamp + expiration_time < new Date().getTime()) {
        response.loadPrev(function(data, delta) {
          bage_count += delta.length;
          Backpane.setBage(bage_count);
          formatActivities(delta, true);
          insertNew(delta);
        });
      }
    }
  }

  function updateOld() {
    response.loadNext(function(data, delta) {
      if(delta.length != 0) {
        formatActivities(delta);
        insertOld(delta);
      } else {
        pull_up_end_reached = true;
        $('.pull_up').css('display', 'none');
      }
    });
  }

  App.ticker.subscribe(updateNew);

  App.activities = {
    load: function(callback) {
      $('.activities span.icon-refresh').addClass('icon-spin');

      return API.request('GET', '/transaction/history', {limit:15})
        .success(function(tmp) {
          response = tmp;
          formatActivities(response.data.result);

          $('.activities span.icon-refresh').removeClass('icon-spin');

          return callback(response);
        })
        .send();
    },

    get: function(callback) {
      if(response) {
        return callback(response);
      } else {
        return this.load(callback);
      }
    },

    update: function(callback) {
      return this.get(function(response) {
        $(".activities li").not(".list-divider").remove();

        var html = '';
        for (var i = 0, l = response.data.result.length; i < l; i++) {
          html += Template.compileElement(template, response.data.result[i]);
        }

        $('.activities .list-divider').after(html);

        $('.activities li').fadeIn();

        if(callback)
          return callback(response.data.result);
      });
    }
  };
})();
