/**
 * Copyright © 2015 STRG.AT GmbH, Vienna, Austria
 *
 * This file is part of the The SCORE Framework.
 *
 * The SCORE Framework and all its parts are free software: you can redistribute
 * them and/or modify them under the terms of the GNU Lesser General Public
 * License version 3 as published by the Free Software Foundation which is in the
 * file named COPYING.LESSER.txt.
 *
 * The SCORE Framework and all its parts are distributed without any WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. For more details see the GNU Lesser General Public
 * License.
 *
 * If you have not received a copy of the GNU Lesser General Public License see
 * http://www.gnu.org/licenses/.
 *
 * The License-Agreement realised between you as Licensee and STRG.AT GmbH as
 * Licenser including the issue of its valid conclusion and its pre- and
 * post-contractual effects is governed by the laws of Austria. Any disputes
 * concerning this License-Agreement including the issue of its valid conclusion
 * and its pre- and post-contractual effects are exclusively decided by the
 * competent court, in whose district STRG.AT GmbH has its registered seat, at
 * the discretion of STRG.AT GmbH also the competent court, in whose district the
 * Licensee has his registered seat, an establishment or assets.
 */

// Universal Module Loader
// https://github.com/umdjs/umd
// https://github.com/umdjs/umd/blob/v1.0.0/returnExports.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['score.oop', 'bluebird'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('score.oop'), require('bluebird'));
    } else {
        // Browser globals (root is window)
        root.score.router = factory(score.oop, Promise);
    }
}(this, function(oop, BPromise) {

    var Route = oop.Class({
        __name__: 'Route',

        __init__: function(self, path, loader, params2urlparts, urlparts2params) {
            self.path = path;
            self._setParamHandlers();
            self.loader = loader;
            if (typeof params2urlparts !== 'undefined') {
                self.params2urlparts = params2urlparts;
            }
            if (typeof urlparts2params !== 'undefined') {
                self.urlparts2params = urlparts2params;
            }
        },

        invoke: function(self, parameters) {
            var promise = BPromise.resolve();
            if (typeof promise.cancellable === 'function') {
                promise = promise.cancellable();
            }
            return promise.then(function() {
                return self.loader.call(self, parameters);
            });
        },

        url: function(self, parameters) {
            if (typeof parameters === 'undefined') {
                parameters = {};
            }
            if (self.params2urlparts) {
                parameters = self.params2urlparts(parameters);
            }
            return self.parts2url(parameters);
        },

        handle: function(self, url) {
            var params = self.extractParams(url);
            if (params === null) {
                return null;
            }
            if (self.urlparts2params) {
                params = self.urlparts2params(params);
                if (params === null) {
                    return null;
                }
            }
            return self.invoke(params);
        },

        extractParams: function(self, url) {
            var match = self.regex.exec(url);
            if (!match) {
                return null;
            }
            return self.match2parts(match);
        },

        _setParamHandlers: function(self) {
            var parts = [];
            var path = self.path;
            while (path.length) {
                var start = path.indexOf('{');
                var end = path.indexOf('}');
                if (start < 0 || end < 0) {
                    parts.push(path);
                    path = '';
                    break;
                }
                if (start !== 0) {
                    parts.push(path.substring(0, start));
                }
                var name = path.substring(start + 1, end);
                var regex = '.*?';
                var colon = name.indexOf(':');
                if (colon > 0) {
                    regex = name.substring(colon + 1);
                    name = name.substring(0, colon);
                }
                parts.push({
                    'name': name,
                    'regex': regex
                });
                path = path.substring(end + 1);
            }
            var regex = '';
            var idx2name = {};
            var idx = 1;
            for (var i = 0; i < parts.length; i++) {
                if (typeof parts[i] === 'object') {
                    regex += '(' + parts[i].regex.replace(/\((?!\?:)/, '(?:') + ')';
                    idx2name[idx++] = parts[i].name;
                } else {
                    regex += parts[i];
                }
            }
            regex = '^' + regex + '$';
            self.regex = new RegExp(regex);
            self.match2parts = function(match) {
                var obj = {};
                for (var idx in idx2name) {
                    obj[idx2name[idx]] = match[idx];
                }
                return obj;
            };
            self.parts2url = function(params) {
                var url = '';
                for (var i = 0; i < parts.length; i++) {
                    if (typeof parts[i] === 'object') {
                        url += params[parts[i].name];
                    } else {
                        url += parts[i];
                    }
                }
                return url;
            };
        }

    });

    var Router = oop.Class({
        __name__: 'Router',

        __static__: {
            VERSION: '0.1.1'
        },

        routes: {},

        addRoute: function(self, name, path, loader, params2urlparts, urlparts2params) {
            if (name in self.routes) {
                throw new Error('Route "' + name + '" already configured');
            }
            self.routes[name] = new Route(path, loader, params2urlparts, urlparts2params);
        },

        load: function(self, url) {
            for (var name in self.routes) {
                var result = self.routes[name].handle(url);
                if (result) {
                    return result;
                }
            }
            throw new Error('No route could handle the url: ' + url);
        },

        invoke: function(self, name, parameters) {
            if (!(name in self.routes)) {
                throw new Error('No route called "' + name + '" configured');
            }
            return self.routes[name].invoke(parameters);
        },

        url: function(self, name, parameters) {
            if (!(name in self.routes)) {
                throw new Error('No route called "' + name + '" configured');
            }
            return self.routes[name].url(parameters);
        }

    });

    return Router;

}));
