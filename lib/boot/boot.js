var CodeMirror = require('codemirror');
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
console.log($$('.run'))
$$('.run').addEventListener('click', function () {
  console.log(editor.getValue())
  debug.load(editor.getValue());
  debug.run();
});

$$('.resume').addEventListener('click', function () {
  debug.run();
  updateDebugger();
});

$$('.step-over').addEventListener('click', function () {
  debug.stepOver();
  updateDebugger();
});

$$('.step-out').addEventListener('click', function () {
  debug.stepOut();
  updateDebugger();
});

$$('.step-in').addEventListener('click', function () {
  debug.stepIn();
  updateDebugger();
});

debug.on('breakpoint', function () {
  updateDebugger();
});

function renderStack(stack) {
  var list = '<ul>';
  stack.forEach(function (frame) {
    if (frame)
      list += '<li><span>' + frame.name + '</span><span>' + frame.filename + '</span></li>';
  });
  list += '</ul>';
  return list;
}

function renderScope(frame) {
  if (!frame) return;
  console.log(frame.scope)
  var list = '<ul>';
  [].slice.call(frame.scope).forEach(function (vare) {
    console.log(vare)
    list += '<li>' + vare.name + '</li>';
  });
  list += '</ul>';
  return list;
}

function updateDebugger() {
  var stack = debug.machine.getCallStack();
  $$('.call-stack').innerHTML = renderStack(stack);
  console.log(stack)
  $$('.var-scope').innerHTML = renderScope(stack[stack.length - 1]);
  console.log('state', debug.machine.getState())
  var lineno = debug.machine.getState().value && debug.machine.getState().value.start.line;
  if (lineno) {
    $('.selected').forEach(function (l) { l.classList.remove('selected'); });
    $$('.CodeMirror-code').childNodes[lineno - 1].classList.add('selected');
  }
}
