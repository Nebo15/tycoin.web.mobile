var Template = (function() {
  // Registering Handlebars helpers
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

  Handlebars.registerHelper('if-gt', function(first, second, options) {
    console.log(first, second);
    if(first > second) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('if-lt', function(first, second, options) {
    if(first < second) {
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

  Handlebars.registerHelper('link', function(link)
  {
    link = link.replace('odom://', '#');
    link = link.replace('?', ':');
    return new Handlebars.SafeString(link);
  });

  return {
    load: function(name) {
      var ajax = $.ajax({
        type:     'GET',
        url:      'views/' + name + '.html',
        dataType: 'html',
        cache:    false // Cache turned off for debug
      });

      // Load event handlers
      ajax.done(function(template_data) {
        console.log("Template file loaded");
        $("#template_holder").html(template_data);

        $.event.trigger({
            type: 'pageLoadSuccess',
            renderer: Template.render
        });
      });

      ajax.error(function() {
        alert("Can't load template file.");
      });
    },

    renderElement: function(source, target, data) {
      var template = Handlebars.compile(source.html());
      var html     = template(data);

      target.empty();
      target.html(html);
    },

    render: function(data, source) {
      if(undefined === source)
        source = $('#content_template');

      // Render conetent
      if(undefined === data)
          data = {};

      data.current_user = Storage.get('user');
      data.current_day  = Storage.get('current_day');
      data.params       = Page.getParams();

      Template.renderElement(source, $('.content'), data);

      // Render header if exists
      if($('#header_template').size())
        Template.renderElement($('#header_template'), $('header'), data);

      $.event.trigger({
          type: 'pageRender'
      });
    }
  };
})();
