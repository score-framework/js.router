.. _js_router:

score.router
============

A small routing library for javascript. It does not impose any constraints on
the transport of the routing strings (i.e. URLs), but limits itself to the
generation and parsing of such strings.

The usage is quite simple: create routes with ``addRoute``, create urls with
``url`` and invoke the registered routes via ``load``::

    require(['lib/score/router'], function(Router) {

        var router = new Router();

        router.addRoute('home', '/', function() {
            alert('loading home');
        });

        var url = router.url('home');

        // url is now '/'

        router.load(url);

    });

It is possible to define variables to routes. These have to provided as
bracket-encapsulated strings in the url template and as arguments object to
the ``url`` function::

    require(['lib/score/router'], function(Router) {

        var router = new Router();

        router.addRoute('user', '/user/{id}', function(vars) {
            alert('loading user ' + vars.id);
        });

        var url = router.url('user', {id: 42});

        router.load(url);

    });

It is also possible to provide converters to newly added routes. These
converter functions are responsible for turning the javascript-representation
of an object into its URL representation and vice versa::

    require(['lib/score/router', 'Customer'], function(Router, Customer) {

        var router = new Router();

        router.addRoute('user', '/user/{id}', function(vars) {
            // note that we are not accessing "id", but "customer" this time
            alert('loading user ' + vars.customer.name);
        }, function(vars) {
            // conversion from javascript to url parts
            return {id: vars.customer.id};
        }, function(vars) {
            // url parts to javascript
            return {customer: Customer.get(vars.id)};
        });

        var url = router.url('user', {customer: Customer.get(42)});

        // url is "/user/42"

        router.load(url);

    });
