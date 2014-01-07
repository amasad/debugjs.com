var Console = require('console');
var Hogan = require('hogan.js');

var debugjs = require('debugjs');
var util = require('node-util');
var dom = require('dom');
var tScope = Hogan.compile(require('./scope_template'));
var tStack = Hogan.compile(require('./stack_template'));

function renderStack(stack) {
  return tStack.render({stack: stack.slice().reverse()});
}
function renderScope(frame) {
  frame.scope.forEach(function (o) {
    o.value = frame.evalInScope(o.name) + '';
  });
  return tScope.render(frame);
}

/**
 * @constructor
 * @param {EventEmitter} emitter
 * @param {array<File>} files
 */
function DevTools(emitter, files) {
  this.container = dom('.component-devtools');
  // Only do it on init time so the console can work.
  this.files = files;
  this.$resetDebugger();
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
  this.find('.resume').on('click', this.$onResume.bind(this));
  this.find('.step-over').on('click', this.$onStepOver.bind(this));
  this.find('.step-out').on('click', this.$onStepOut.bind(this));
  this.find('.step-in').on('click', this.$onStepIn.bind(this));
}

DevTools.prototype.$resetDebugger = function() {
  var konsole = this.console;
  var debug = debugjs.createDebugger({
    iframeParentElement: dom('.code-result .result').empty()[0],
    sandbox: {
      console: {
        log: function (a) {
          konsole.log(util.inspect(a));
        }
      }
    }
  });
  var context = debug.getContext();
  // TODO: push that down to context-eval.
  context.iframe.style.display = 'block';
  debug.on('breakpoint', this.updateDebugger.bind(this, true));
  debug.machine.on('error', this.$logError.bind(this));
  var doc = context.iframe.contentDocument;
  doc.open();
  doc.write(this.$getCode().html);
  doc.close();
  this.files.forEach(function (f) {
    debug.addBreakpoints(f.filename(), f.debuggerBreakpoints());
  });
  this.debug = debug;
};

DevTools.prototype.$logError = function (err) {
  this.console.log(err.name + ': ' + err.message, 'error');
};

DevTools.prototype.$onCommand = function (val) {
  var frame = this.debug.getCurrentStackFrame();
  var res;
  try {
    if (frame) {
      res = frame.evalInScope(val);
    } else {
      res = this.debug.getContext().evaluate(val);
    }
    this.console.result(res);
  } catch (e) {
    this.$logError(e);
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
  this.updateDebugger();
};

DevTools.prototype.$onStepOut = function () {
  this.debug.stepOut();
  this.updateDebugger();
};

DevTools.prototype.$onStepOver = function () {
  this.debug.stepOver();
  this.updateDebugger();
};

DevTools.prototype.$onResume = function () {
  this.debug.run();
  this.updateDebugger();
};

DevTools.prototype.$getCode = function () {
  var html, js;
  this.files.forEach(function (f) {
    if (f.filename() === 'index.js') {
      js = f.text();
    } else {
      html = f.text();
    }
  });
  return {
    html: html,
    js: js
  };
};

/**
 * Find an element in the container.
 * @api
 */
DevTools.prototype.find = function () {
  return this.container.find.apply(this.container, arguments);
};

/**
 * Update the debugger UI.
 * @api
 * @param {boolean} paused
 */
DevTools.prototype.updateDebugger = function () {
  var stack = this.debug.getCallStack();
  this.find('.call-stack').html(renderStack(stack));
  this.find('.var-scope').html(renderScope(stack[stack.length - 1]));
  var loc = this.debug.getCurrentLoc();
  var lineno = loc.start.line;
  if (this.debug.paused()) {
    this.find('.toolbar .btn').removeAttr('disabled');
    this.emitter.emit('component-debugger:paused', lineno);
  } else {
    this.find('.toolbar .btn').attr('disabled', true);
    this.emitter.emit('component-debugger:resumed', lineno);
  }
};

/**
 * @api
 * Load and run the code.
 */
DevTools.prototype.loadAndRun = function () {
  // Hardcode our two files for now.
  this.$resetDebugger();
  this.debug.load(this.$getCode().js, 'index.js');
  this.debug.run();
};

module.exports = DevTools;
