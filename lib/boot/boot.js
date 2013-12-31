var Editor = require('editor');
var EventEmitter = require('emitter');
var Console = require('console');
var Debugger = require('debugger');

var dom = require('dom');

var debug = debugjs.createDebugger({
  iframeParentElement: dom('.result').get(0)
});

debug.machine.context.iframe.style.display = 'block';

var emitter = new EventEmitter();

Debugger(emitter, debug);
Console(emitter, debug);

var Editor = new Editor(emitter);
emitter.on('component-editor:run', function (code) {
  debug.load(code, 'main.js');
  debug.run();
});
