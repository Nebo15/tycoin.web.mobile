// Registering Handlebars helpers
(function() {
  Handlebars.registerHelper('render', function(name, context) {
    var subTemplate =  Handlebars.compile($('#' + name).html());
    var subTemplateContext = $.extend({},this,context.hash);
    return new Handlebars.SafeString(subTemplate(subTemplateContext));
  });

  var subtemplates = [];
  Handlebars.registerHelper('include', function(name, context) {
    if(subtemplates[name] === undefined) {
      var ajax = $.ajax({
          type:     'GET',
          url:      'views/shared/' + name + '.html',
          dataType: 'html',
          async:    false,
          cache:    false // Cache turned off for debug
      });

      ajax.done(function(contents) {
        subtemplates[name] = contents;
      });

      ajax.error(function() {
        alert("Can't load subtemplate!");
      });
    }

    var subTemplate = Handlebars.compile(subtemplates[name]);
    var subTemplateContext = $.extend({},this,context.hash);

    return new Handlebars.SafeString(subTemplate(subTemplateContext));
  });

  Handlebars.registerHelper('if-eq', function(first, second, options) {
    if(first == second) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('if-neq', function(first, second, options) {
    if(first != second) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('news', function(text, time)
  {
    var period = Tools.prettyDate(time*1000);
    text = text.replace('odom://users/', '#user:id=');
    text = text.replace('odom://days/', '#day:id=');
    return new Handlebars.SafeString("<li><p>"+text+"</p><span class=\"count\">"+period+"</span></li>");
  });

  $.initFollowUnfollowButtons = function(callback)
  {
    function onFollow($el) {
      Backend.PostRequest('/users/' + $el.attr('user_id') + '/follow').done(function () {
        $el.hide();
        $el.parent().children('.unfollow').show();
        if(undefined !== callback)
          callback();
      });
    }

    function onUnfollow($el) {
      if (true != confirm("Do your really won't to unfollow this user?"))
        return;
      var user_id = $el.attr('user_id');
      Backend.PostRequest('/users/' + user_id + '/unfollow').done(function ()
      {
        $el.hide();
        $el.parent().children('.follow').show();
        if(undefined !== callback)
          callback();
      });
    }

    $('.follow').click(function () { onFollow($(this));});
    $('.unfollow').click(function () { onUnfollow($(this)); });
  };
})();
