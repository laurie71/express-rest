var path = require('path');
require.paths.unshift(path.join(__dirname, '../../lib'));

//// xxx
var sys = require('sys');
//sys.debug('1');
//console.dir(require.paths);
//sys.debug('2');
//// xxx

/**
 * Module dependencies.
 */

var express = require('express');
var xrest = require('express-rest');
var blog = require('./app/index');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyDecoder());
  app.use(express.methodOverride());
  app.use(express.cookieDecoder());
  app.use(express.session({ secret: 'xxx' }));
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res) { res.render('index'); });
app.get('/index.html', function(req, res) { res.render('index'); });


// TODO explain
sys.debug('app: mount /blog');
app.restful('/blog', {}, blog.entries);
//app.restful('/blog/:title/comments', {}, blog.comments); TODO


// Only listen on $ node app.js

if (! module.parent) {
  app.on('listening', function() {
    console.log("Express/xRest 'Blog' example listening on port %d",
      app.address().port);
  });
  app.listen(3000);
}
