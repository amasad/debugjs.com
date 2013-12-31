var Editor = require('editor');
var EventEmitter = require('emitter');
var DevTools = require('devtools');

var emitter = new EventEmitter();
var editor = new Editor(emitter);
var devTools = new DevTools(emitter);
