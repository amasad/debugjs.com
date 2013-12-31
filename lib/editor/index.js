var dom = require('dom');
var CodeMirror = require('codemirror');
require('codemirror-mode-javascript')(CodeMirror);

function Editor(emitter) {
  this.emitter = emitter;
  this.container = dom('component-editor');
  this.editor = new CodeMirror(this.find('.editor').get(0), {
    value: '1;\ndebugger;\nconsole.log("x")',
    gutters: ["CodeMirror-linenumbers", "breakpoints"],
    lineNumbers: true,
    mode:  "javascript"
  });
  this.editor.on("gutterClick", function(cm, n) {
    var info = cm.lineInfo(n);
    cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
  });

  function makeMarker() {
    var marker = document.createElement("div");
    marker.style.color = "#822";
    marker.innerHTML = "●";
    return marker;
  }

  this.$bindEvents();
}

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
