.. image:: https://raw.githubusercontent.com/score-framework/py.doc/master/docs/score-banner.png
    :target: http://score-framework.org

`The SCORE Framework`_ is a collection of harmonized python and javascript
libraries for the development of large scale web projects. Powered by strg.at_.

.. _The SCORE Framework: http://score-framework.org
.. _strg.at: http://strg.at


************
score.router
************

.. _js_router:

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


License
=======

Copyright © 2015 STRG.AT GmbH, Vienna, Austria

All files in and beneath this directory are part of The SCORE Framework.
The SCORE Framework and all its parts are free software: you can redistribute
them and/or modify them under the terms of the GNU Lesser General Public
License version 3 as published by the Free Software Foundation which is in the
file named COPYING.LESSER.txt.

The SCORE Framework and all its parts are distributed without any WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. For more details see the GNU Lesser General Public License.

If you have not received a copy of the GNU Lesser General Public License see
http://www.gnu.org/licenses/.

The License-Agreement realised between you as Licensee and STRG.AT GmbH as
Licenser including the issue of its valid conclusion and its pre- and
post-contractual effects is governed by the laws of Austria. Any disputes
concerning this License-Agreement including the issue of its valid conclusion
and its pre- and post-contractual effects are exclusively decided by the
competent court, in whose district STRG.AT GmbH has its registered seat, at the
discretion of STRG.AT GmbH also the competent court, in whose district the
Licensee has his registered seat, an establishment or assets.
