if (typeof loadScore === 'undefined') {

    var loadScore = function loadScore(modules, callback) {
        var fs = require('fs'),
            request = require('sync-request'),
            vm = require('vm');
        if (typeof modules === 'function') {
            callback = modules;
            modules = [];
        } else if (!modules) {
            modules = [];
        }
        var loaded = {};
        var customRequire = function(module) {
            if (loaded[module]) {
                return loaded[module];
            }
            var script, url, name = module.substring('score.'.length);
            if (testConf[name] === 'local') {
                script = fs.readFileSync(__dirname + '/../' + name.replace('.', '/') + '.js', {encoding: 'UTF-8'});
            } else if (testConf[name]) {
                url = 'https://raw.githubusercontent.com/score-framework/js.' + name + '/' + testConf[name] + '/' + name + '.js';
            } else {
                url = 'https://raw.githubusercontent.com/score-framework/js.' + name + '/master/' + name + '.js';
            }
            if (url) {
                if (!loadScore.cache[url]) {
                    loadScore.cache[url] = request('GET', url).getBody('utf8');
                }
                script = loadScore.cache[url];
            }
            var sandbox = vm.createContext({require: customRequire, module: {exports: {}}});
            vm.runInContext(script, sandbox, module + '.js');
            loaded[module] = sandbox.module.exports;
            return loaded[module];
        };
        var score = customRequire('score.init');
        for (var i = 0; i < modules.length; i++) {
            customRequire('score.' + modules[i]);
        }
        callback(score);
    };

    loadScore.cache = {};

    var expect = require('expect.js');
}

var testConf = {
    'router': 'local'
};

describe('score.router', function() {

    describe('module', function() {

        it('should add the score.router class', function(done) {
            loadScore(['oop'], function(score) {
                expect(score).to.be.an('object');
                expect(score.router).to.be(undefined);
                loadScore(['oop', 'router'], function(score) {
                    expect(score).to.be.an('object');
                    expect(score.router).to.be.a('function');
                    expect(score.router()).to.be.an('object');
                    done();
                });
            });
        });

    });

    describe('empty router', function() {

        it('should raise error for all URLs', function(done) {
            loadScore(['oop', 'router'], function(score) {
                var router = score.router();
                expect(function() { router.load('/'); }).to.throwError();
                done();
            });
        });

    });

    describe('router with simple route', function() {

        it('should call the registered function', function(done) {
            loadScore(['oop', 'router'], function(score) {
                var router = score.router();
                expect(function() { router.load('/'); }).to.throwError();
                router.addRoute('home', '/', function() {
                    done();
                });
                router.load('/');
            });
        });

        it('should pass an empty parameters object', function(done) {
            loadScore(['oop', 'router'], function(score) {
                var router = score.router();
                router.addRoute('home', '/', function() {
                    expect(arguments.length).to.be(1);
                    expect(arguments[0]).to.eql({});
                    done();
                });
                router.load('/');
            });
        });

    });

});

