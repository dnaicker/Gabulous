var http = require('http');
var mime = require('mime');
var url = require('url');
var path = require('path');
var util = require('util');
var fs = require('fs');
var faye = require('faye');
var express = require('express');
var WebSocket = require('faye-websocket');
var GabServer = require('./lib/GabServer.js');
var Twitter= require('./lib/twitter.js');
var Proxy = require('./lib/proxy.js');

var twit = twit || {};
var twitter = new Twitter(); 
var proxy = new Proxy();

// Main:
function Main() {
    twit.app = express.createServer();
    twit.app.use(express.static(process.cwd()));
    twit.app.use(express.cookieParser()); 
    twit.app.use( express.session( { secret: 'whateva' } ) );

    var allowCrossDomain = function(req, res, next) {
    	console.log("Applying allowCrossDomain to", req.url);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        next();
    }
    
      twit.app.configure(function(){
      twit.app.set('views', __dirname + '/views');
      twit.app.set('view engine', 'jade');
      twit.app.use(express.bodyParser());
      twit.app.use(express.methodOverride());
      twit.app.use(require('stylus').middleware({ src: __dirname + '/public' }));
//      twit.app.use(allowCrossDomain);
      twit.app.use(twit.app.router);
      twit.app.use(express.static(__dirname + '/public'));
    });

    
    // Create pub/sub server
    twit.gabServer = GabServer.create();
    // Attach it to http server
    twit.gabServer.attachToHttpServer(twit.app);
    // twit.app.listen(8080, '10.104.86.106');
    twit.app.listen(8080, '127.0.0.1');
    
    // Root route    
    twit.app.get('/', function(req, res){
      if(req.session.twitterScreenName){
        console.log('req.session',req.session);
        res.render('authenticated', {
          title: 'Welcome back!',
          screenName: req.session.twitterScreenName
        });
      } else {
        res.render('index', {
          title: 'Welcome to Gabulous!'
        });
      }
     });

    // Twitter get_friends route
    twit.app.get('/get_friends',function(req,res){
      twitter.getUserFriends(req,res);
    });

    // Twitter authentication route
    twit.app.get('/auth/twitter',function(req,res){
      twitter.authenticate(req,res);
    });

    // Twitter authentication callback
    twit.app.get('/auth/twitter/callback',function(req, res, next){
      twitter.postAuthCallback(req, res, next);  
    });

    // Twitter authentication callback
    twit.app.get('/proxy',function(req, res, next){
    	console.log("in proxy url");
      proxy.get(req, res);  
    });
    
}

Main();
