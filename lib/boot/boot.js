var Editor = require('editor');
var EventEmitter = require('emitter');
var DevTools = require('devtools');
var dom = require('dom');

var emitter = new EventEmitter();
var editor = new Editor(emitter);
var devTools = new DevTools(emitter);

var files = dom('header .files');
files.on('click', 'a', function (e) {
  files.find('.active').removeClass('active');
  var el = dom(e.target).parent();
  el.addClass('active');
  emitter.emit('component-header:file change', el.attr('data-filename'));
});
