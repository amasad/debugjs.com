var CodeMirror = require('codemirror');
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

var editor = new CodeMirror($$('.code'), {
  mode:  "javascript"
});
editor.on('change', function () {
  
});

$$('.run').addEventListener('click', function () {
  debug.load(editor.getValue());
  debug.run();
})

var emitter = new EventEmitter();
emitter.on('component-debugger:paused', function (lineno) {
  $('.selected').forEach(function (el) {el.classList.remove('selected')});
  $$('.CodeMirror-code').childNodes[lineno - 1].classList.add('selected');
});

require('debugger')(debug, emitter);
