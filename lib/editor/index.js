var dom = require('dom');
var CodeMirror = require('codemirror');
require('codemirror-mode-javascript')(CodeMirror);

function Editor(emitter) {
  this.emitter = emitter;
  this.container = dom('component-editor');
  this.editor = new CodeMirror(this.find('.editor').get(0), {
    value: ['function makeDiv(html) {',
            '  var div = document.createElement("div");',
            '  div.innerHTML = html',
            '  return div;',
            '}',
            'function start() {',
            '  for (var i = 0; i < 10; i++)',
            '     document.body.appendChild(makeDiv(i));',
            '}',
            'start()'].join('\n'),
    gutters: ["CodeMirror-linenumbers", "breakpoints"],
    lineNumbers: true,
    mode:  "javascript"
  });
  this.editor.on('gutterClick', this.$onGutterClick.bind(this));
  this.$bindEvents();
}

Editor.prototype.$onGutterClick = function (cm, n) {
  var info = cm.lineInfo(n);
  var marker = info.gutterMarkers ? null : this.$makeMarker();
  cm.setGutterMarker(n, 'breakpoints', marker);
  if (marker) {
    this.emitter.emit('component-editor:breakpoint add', n + 1);
  } else {
    this.emitter.emit('component-editor:breakpoint remove', n + 1);
  }
};

Editor.prototype.$makeMarker = function() {
  return dom('<div/>')
    .addClass('marker')
    .text('●')
    .get(0);
};

Editor.prototype.$bindEvents = function () {
  this.emitter.on('component-debugger:paused', this.$highlightLine.bind(this));
  this.find('.run').on('click', function () {
    this.emitter.emit('component-editor:run', this.getValue());
  }.bind(this));
};

Editor.prototype.$highlightLine = function(lineno) {
  if (this.$hLineno != null) {
    this.editor.removeLineClass(this.$hLineno, 'background', 'selected');
  }
  if (lineno) {
    this.$hLineno = lineno - 1;
    this.editor.addLineClass(this.$hLineno, 'background', 'selected');
  }
};

Editor.prototype.find = function () {
  return this.container.find.apply(this.container, arguments);
};

Editor.prototype.getValue = function () {
  return this.editor.getValue();
};

module.exports = Editor;
