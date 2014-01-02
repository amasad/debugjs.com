/* global debugjs: false */

var Console = require('console');
var Hogan = require('hogan.js');

var dom = require('dom');

var tScope = Hogan.compile(require('./scope_template'));
var tStack = Hogan.compile(require('./stack_template'));
function renderStack(stack) {
  return tStack.render({stack: stack});
}
function renderScope(frame) {
  if (!frame) return;
  frame.scope = [].slice.call(frame.scope);
  return tScope.render(frame);
}

function DevTools(emitter) {
  this.container = dom('.component-devtools');
  this.debug = debugjs.createDebugger({
    iframeParentElement: dom('.result').get(0)
  });
  // TODO: push that down to contetx-eval.
  this.debug.machine.context.iframe.style.display = 'block';
  this.console = new Console();
  this.find('.console').append(this.console.el);
  this.console.on('command', this.$onCommand.bind(this));
  this.emitter = emitter;
  emitter.on(
    'component-editor:breakpoint add',
    this.$addBreakpoint.bind(this)
  );
  emitter.on(
    'component-editor:breakpoint remove',
    this.$removeBreakpoint.bind(this)
  );
  emitter.on('component-editor:run', this.loadAndRun.bind(this));
  this.debug.on('breakpoint', this.updateDebugger.bind(this, true));
  this.find('.resume').on('click', this.$onResume.bind(this));
  this.find('.step-over').on('click', this.$onStepOver.bind(this));
  this.find('.step-out').on('click', this.$onStepOut.bind(this));
  this.find('.step-in').on('click', this.$onStepIn.bind(this));
}

DevTools.prototype.find = function () {
  return this.container.find.apply(this.container, arguments);
};

DevTools.prototype.$onCommand = function (val) {
  var frame = this.debug.machine.getCurrentStackFrame();
  var res;
  try {
    if (frame) {
      res = frame.evalInScope(val);
    } else {
      res = this.debug.machine.context.evaluate(val);
    }
    this.console.result(res);
  } catch (e) {
    this.console.log(e.name + ': ' + e.message, 'error');
  }
};

DevTools.prototype.$addBreakpoint = function (lineno) {
  this.debug.addBreakpoints('index.js', [lineno]);
};

DevTools.prototype.$removeBreakpoint = function (lineno) {
  this.debug.removeBreakpoints('index.js', [lineno]);
};

DevTools.prototype.$onStepIn = function () {
  this.debug.stepIn();
  this.updateDebugger(true);
};

DevTools.prototype.$onStepOut = function () {
  this.debug.stepOut();
  this.updateDebugger(true);
};

DevTools.prototype.$onStepOver = function () {
  this.debug.stepOver();
  this.updateDebugger(true);
};

DevTools.prototype.$onResume = function () {
  this.updateDebugger(false);
  this.debug.run();
};

DevTools.prototype.updateDebugger = function (paused) {
  var stack = this.debug.machine.getCallStack();
  this.find('.call-stack').html(renderStack(stack));
  this.find('.var-scope').html(renderScope(stack[stack.length - 1]));
  var state = this.debug.machine.getState();
  var lineno = state && state.value && state.value.start.line;
  this.emitter.emit('component-debugger:paused', lineno);
  if (paused) {
    this.find('.toolbar .btn').removeAttr('disabled');
  } else {
    this.find('.toolbar .btn').attr('disabled', true);
  }
};

DevTools.prototype.loadAndRun = function (code, filename) {
  filename = filename || 'index.js';
  console.log(filename)
  this.debug.load(code, filename);
  this.debug.run();
};

DevTools.prototype.getBreakpoints = function () {
  return this.debug.getBreakpoints('index.js');
};

module.exports = DevTools;
