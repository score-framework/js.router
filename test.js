/* global loadScore:true, expect:true, describe, it, before, after, HTMLDivElement */

if (typeof loadScore == 'undefined') {
    var tmp = require('./node.js');
    loadScore = tmp.loadScore;
    expect = tmp.expect;
}

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

