var Hogan = require('hogan.js');
var dom = require('dom');

var tScope = Hogan.compile(require('./scope_template'));
var tStack = Hogan.compile(require('./stack_template'));

module.exports = function (emitter, debug) {
  var container = dom('.component-debugger');

  function find() {
    return container.find.apply(container, arguments);
  }

  function renderStack(stack) {
    return tStack.render({stack: stack});
  }

  function renderScope(frame) {
    if (!frame) return;
    frame.scope = [].slice.call(frame.scope);
    return tScope.render(frame);
  }

  function updateDebugger() {
    var stack = debug.machine.getCallStack();
    find('.call-stack').html(renderStack(stack));
    find('.var-scope').html(renderScope(stack[stack.length - 1]));
    var lineno = debug.machine.getState().value && debug.machine.getState().value.start.line;
    emitter.emit('component-debugger:paused', lineno);
  }

  emitter.on('component-editor:breakpoint add', function (lineno) {
    debug.addBreakpoints('main.js', [lineno]);
  });

  emitter.on('component-editor:breakpoint remove', function (lineno) {
    debug.removeBreakpoints('main.js', [lineno]);
  });

  debug.on('breakpoint', function () {
    console.log('breakpoint')
    updateDebugger();
  });
  find('.resume').on('click', function () {
    debug.run();
    updateDebugger();
  });
  find('.step-over').on('click', function () {
    debug.stepOver();
    updateDebugger();
  });
  find('.step-out').on('click', function () {
    debug.stepOut();
    updateDebugger();
  });
  find('.step-in').on('click', function () {
    debug.stepIn();
    updateDebugger();
  });
};
