var App = (function(){
  var balance;
  var activities;
  var activities_utime;
  var activity_tpl = Template.loadSubtemplate('activity');
  var bage_count = 0;

  $(document).bind('backpaneHide', function() {
    bage_count = 0;
  });

  $(document).bind('backpaneShow', function() {
    bage_count = 0;
    App.updateActivities();
  });

  $(document).bind('pageRender', function() {
    Backpane.setBage(bage_count);
  });

  var updateState = function() {
    var tmp_activities = activities ? activities.slice() : undefined;

    App.getActivities(function() {
      if(tmp_activities)
        bage_count = Math.abs(activities.length - tmp_activities.length);

      // if(tmp_activities) {
      //   $.each(activities, function(index, value) {
      //     if(tmp_activities[index] === undefined) {
      //       if(activities[index].subtype == "+") {
      //         bage_count++;
      //         update.push(activities[index]);
      //       }
      //     }
      //   });
      // }

      if(bage_count > 0) {
        Backpane.setBage(bage_count);

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
      }

      App.updateActivities();
    });
  };

  $(window).load(function() {
    $('.activities span.icon-refresh').tap(updateState);
  });

  var ticker = function() {
    updateState();
    setTimeout(ticker, 20000);
  };
  setTimeout(ticker, 20000);

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

            App.updateBalance();
            callback(balance);
          })
          .send();
      }
    },

    updateBalance: function(callback) {
      var updateBages = function() {
        $('.coins-counts[type=give] .coin-usual').html(balance.usual_coins_to_send);
        $('.coins-counts[type=give] .coin-big').html(balance.big_coins_to_send);
        $('.coins-counts[type=exchange] .coin-usual').html(balance.received_coins_count);
        $('.coins-counts[type=exchange] .coin-big').html(balance.received_big_coins_count);

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
        $('.activities span.icon-refresh').addClass('icon-spin');

        API.request('GET', '/transaction/history')
          .success(function(response) {
            activities_utime = new Date().getTime();
            activities = response.data.result;

            var current_user = Storage.get('user');
            $.each(activities, function(index, value) {
              activities[index].time = Tools.prettyDateShort(value.time * 1000);

              if(value.recipient_id == current_user.id) {
                activities[index].subtype = '+';
              } else {
                activities[index].subtype = '-';
              }
            });

            $('.activities span.icon-refresh').removeClass('icon-spin');
            callback(activities);
          })
          .send();
      }
    },

    updateActivities: function(callback) {
      var updateActivitiesList = function(list) {
        list = list.slice().reverse();

        $(".activities li").not(".list-divider").remove();

        $.each(list, function(index, value) {
          var html = Template.compileElement(activity_tpl, value);
          $(html).insertAfter($('.activities .list-divider'));
        });

        if(callback)
          callback(list);

      };

      if(activities === undefined) {
        App.getActivities(updateActivitiesList, true);
      } else {
        updateActivitiesList(activities);
      }
    },

    dropCache: function() {
      balance = undefined;
      activities = undefined;
    }
  };
})();
