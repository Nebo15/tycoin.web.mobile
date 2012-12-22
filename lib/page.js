var Page = new function() {
    var render = function(data, source) {
        if(undefined === source)
          source = $('#content_template');

        // Render conetent
        if(undefined === data)
            data = {};

        data.current_user = Storage.get('user');
        data.current_day  = Storage.get('current_day');

        Page.renderElement(source, $('.content'), data);

        // Render header if exists
        if($('#header_template').size())
          Page.renderElement($('#header_template'), $('header'), data);

        Loader.hide();
        $.event.trigger({
            type: 'pageRender'
        });
    };

    // Loading events
    var onPageLoad = function() {
        Loader.show("");

        $.event.trigger({
            type: 'pageBeforeLoad'
        });
    };

    var onPageLoadSuccess = function(template_data) {
        console.log("Template file loaded.");
        $("#template_holder").html(template_data);

        $.event.trigger({
            type: 'pageLoad',
            renderer: render
        });
    };

    var onPageLoadError = function() {
        alert("Can't load template file.");
    };

    /**
     * Load page.
     *
     * @param string name
     */
    this.load = function(name) {
        var ajax = $.ajax({
            type:     'GET',
            url:      'views/' + name + '.html',
            dataType: 'html',
            cache:    false, // Cache turned off for debug

            beforeSend: onPageLoad
        });

        // Load event handlers
        ajax.done(onPageLoadSuccess);
        ajax.error(onPageLoadError);
    };

    this.renderElement = function(source, target, data) {
        var template = Handlebars.compile(source.html());
        var html     = template(data);

        target.empty();
        target.html(html);
    };

    /**
     * Reload current page
     *
     * @deprecated Templates shoud handle delete user-friendly (remove dom element when deletion completed, etc.)
     */
    this.reload = function() {
      console.log('Reloading page');
      // Gives overhead but its most efficient
      Navigation.redirectToPageInHash();
    };
};
