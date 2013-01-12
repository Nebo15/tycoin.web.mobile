var App = (function(){
  var balance;
  var activities;
  var activities_utime;

  $(document).bind('backpaneShow', function() {
    App.updateActivities();
  });

  $(document).one('backpaneShow', function() {
    Backpane.setBage(0);
  });

  var updateState = function() {
    var tmp_activities = activities;

    App.getActivities(function() {
      var delta = 0;

      if(tmp_activities) {
        $.each(activities, function(index, value) {
          if(tmp_activities[index] === undefined) {
            if(activities[index].subtype == "+") {
              delta++;
              activities[index].updated = true;
            }
          }
        });
      }

      if(delta > 0) {
        Backpane.setBage(delta);
        App.updateActivities();
      }

      setTimeout(updateState, 10000);
    });
  };

  setTimeout(updateState, 2000);

  return {
    getBalance: function(callback, use_cache) {
      if(use_cache === true && balance) {
        callback(balance);
      } else {
        API.request('GET', '/my/balance')
          .success(function(response) {
            balance = response.data.result;

            balance.coins_to_send     = balance.free_coins_count + balance.purchased_big_coins_count + balance.purchased_coins_count;
            balance.coins_to_exchange = balance.received_coins_count + balance.received_big_coins_count;

            balance.usual_coins_to_send = balance.free_coins_count + balance.purchased_coins_count;
            balance.big_coins_to_send   = balance.purchased_big_coins_count;

            balance.free_coins_available_time_pretty = Tools.prettyDate((new Date().getTime() + 60*60*12) * 1000); // TODO: this is wrong!

            callback(balance);
          })
          .send();
      }
    },

    updateBalance: function(callback) {
      var updateBages = function() {
        $('#coins-to-send').html(balance.coins_to_send);
        $('#coins-to-exchange').html(balance.coins_to_exchange);

        if(callback)
          callback(balance);
      };

      if(balance === undefined) {
        App.getBalance(updateBages, true);
      } else {
        updateBages();
      }
    },

    getActivities: function(callback, use_cache) {
      if(use_cache === true && activities) {
        callback(activities);
      } else {
        API.request('GET', '/transaction/history')
          .success(function(response) {
            activities_utime = new Date().getTime();
            activities = response.data.result;

            var current_user = Storage.get('user');
            $.each(activities, function(index, value) {
              activities[index].time = Tools.prettyDate(value.time * 1000);

              if(value.recipient_id == current_user.id) {
                activities[index].subtype = '+';
              } else {
                activities[index].subtype = '-';
              }
            });

            callback(activities);
          })
          .send();
      }
    },

    updateActivities: function(callback) {
      $('.history span.icon-refresh').stop(true, true).animate({opacity: 1}, 400);

      var updateActivitiesList = function() {
        var tpl = Template.loadSubtemplate('activities');
        Template.renderElement(tpl, $('#transaction_history'), {activities: activities}, function() {
          if(callback)
            callback(activities);

          $('.history span.icon-refresh').stop(true, true).animate({opacity: 0}, 400);
        });
      };

      if(activities === undefined) {
        App.getActivities(updateActivitiesList, true);
      } else {
        updateActivitiesList();
      }
    },

    dropCache: function() {
      balance = undefined;
      activities = undefined;
    }
  };
})();
