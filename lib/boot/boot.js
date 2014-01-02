var Editor = require('editor');
var EventEmitter = require('emitter');
var DevTools = require('devtools');
var UserSession = require('models').UserSession;
var header = require('header');
var emitter = new EventEmitter();

// TODO add loader.
UserSession.loadOrCreateSession(window.location.hash.slice(1), function (session) {
  new Editor(emitter, session.files());
  new DevTools(emitter, session.files());
  header(emitter, session);
});
