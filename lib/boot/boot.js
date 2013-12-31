var Editor = require('editor');
var EventEmitter = require('emitter');

var $ = function (sel) {
  return [].slice.call(document.querySelectorAll(sel));
};
var $$ = function (sel) {
  return document.querySelector(sel);
};

var debug = debugjs.createDebugger({
  iframeParentElement: $$('.result')
});
debug.machine.context.iframe.style.display = 'block';

var emitter = new EventEmitter();

require('debugger')(emitter, debug);
var Editor = new Editor(emitter);
emitter.on('component-editor:run', function (code) {
  debug.load(code, 'main.js');
  debug.run();
});
