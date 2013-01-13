var App = (function(){
  var balance;
  var activities;
  var activities_utime;
  var activity_tpl = Template.loadSubtemplate('activity');
  var bage_count = 0;

  $(document).bind('backpaneShow', function() {
    if(!activities)
      App.updateActivities();
  });

  $(document).one('backpaneShow', function() {
    bage_count = 0;
    Backpane.setBage(bage_count);
  });

  $(document).bind('pageRender', function() {
    Backpane.setBage(bage_count);
  });

  var updateState = function() {
    var tmp_activities = activities;

    App.getActivities(function() {
      if(tmp_activities) {
        $.each(activities, function(index, value) {
          if(tmp_activities[index] === undefined) {
            if(activities[index].subtype == "+") {
              bage_count++;
              activities[index].updated = true;
            }
          }
        });
      }

      if(bage_count > 0) {
        Backpane.setBage(bage_count);

        // var i = activities.length-1;
        // var addIterated = function() {
        //   if(activities[i] !== undefined && activities[i].updated) {
        //     var html = Template.compileElement(activity_tpl, activities[i]);
        //     $(html).insertAfter($('.activities .list-divider'));
        //     i--;
        //     setTimeout(addIterated, 500);
        //   }
        // };
        // addIterated();

        App.updateActivities();
      }

      setTimeout(updateState, 30000);
    });
  };

  setTimeout(updateState, 10000);

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
      $('.activities span.icon-refresh').stop(true, true).animate({opacity: 1}, 400);

      var updateActivitiesList = function() {
        activities.reverse();

        $.each(activities, function(index, value) {
          var html = Template.compileElement(activity_tpl, value);

          $(html).insertAfter($('.activities .list-divider'));
        });

        if(callback)
          callback(activities);

        $('.activities span.icon-refresh').stop(true, true).animate({opacity: 0}, 400);
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
