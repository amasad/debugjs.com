var Editor = require('editor');
var EventEmitter = require('emitter');
var DevTools = require('devtools');
var dom = require('dom');
var UserSession = require('models').UserSession;

var emitter = new EventEmitter();

// TODO add loader.
UserSession.loadOrCreateSession(function (session) {
  console.log(session.files())
  new Editor(emitter, session.files());
  new DevTools(emitter);
});

var files = dom('header .files');
files.on('click', 'a', function (e) {
  files.find('.active').removeClass('active');
  var el = dom(e.target).parent();
  el.addClass('active');
  emitter.emit('component-header:file select', el.attr('data-filename'));
});