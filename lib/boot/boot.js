var Editor = require('editor');
var EventEmitter = require('emitter');
var DevTools = require('devtools');
var dom = require('dom');
var UserSession = require('models').UserSession;

var emitter = new EventEmitter();
/* global Firebase: false */
// TODO add loader.
UserSession.loadOrCreateSession(function (session) {
  new Editor(emitter, session.files());
  var devTools = new DevTools(emitter);
  dom('header .save').on('click', function () {
    var fbase = new Firebase('https://1388566722288.firebaseio.com/');
    var files = session.files().map(function (f) {
      return {
        filename: f.filename(),
        text: f.text()
      }
    });
    var id = fbase.push({files: files, breakpoints: devTools.getBreakpoints()});
    console.log(id);
  });
});

var files = dom('header .files');
files.on('click', 'a', function (e) {
  files.find('.active').removeClass('active');
  var el = dom(e.target).parent();
  el.addClass('active');
  emitter.emit('component-header:file select', el.attr('data-filename'));
});

