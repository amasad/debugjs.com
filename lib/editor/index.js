var dom = require('dom');
var debounce = require('debounce');
var CodeMirror = require('codemirror');
require('codemirror-mode-javascript')(CodeMirror);

function Editor(emitter, files) {
  this.emitter = emitter;
  this.container = dom('component-editor');
  this.files = files;
  this.files.forEach(function (file) {
    file.cmDoc(new CodeMirror.Doc(file.text(), file.mode()));
  });
  this.editor = new CodeMirror(this.find('.editor').get(0), {
    value: this.files[0].cmDoc(),
    gutters: ['CodeMirror-linenumbers', 'breakpoints'],
    lineNumbers: true
  });
  this.editor.on('gutterClick', this.$onGutterClick.bind(this));
  this.editor.on('change', debounce(this.$updateFiles.bind(this)));
  this.emitter.on('component-header:file select', this.$onFileSelect.bind(this));
  this.emitter.on('component-debugger:paused', this.$highlightLine.bind(this));
  this.find('.run').on('click', this.$onRun.bind(this));
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

Editor.prototype.$highlightLine = function(lineno) {
  if (this.$hLineno != null) {
    this.editor.removeLineClass(this.$hLineno, 'background', 'selected');
  }
  if (lineno) {
    this.$hLineno = lineno - 1;
    this.editor.addLineClass(this.$hLineno, 'background', 'selected');
  }
};

Editor.prototype.$onRun = function() {
  this.emitter.emit('component-editor:run', this.getValue());
};

Editor.prototype.$onFileSelect = function (filename) {
  var file = this.files.filter(function (file) {
    return file.filename() === filename;
  })[0];
  this.editor.swapDoc(file.cmDoc());
};

Editor.prototype.$updateFiles = function() {
  this.files.forEach(function (file) {
    file.text(file.cmDoc().getValue());
  });
};

Editor.prototype.find = function () {
  return this.container.find.apply(this.container, arguments);
};

Editor.prototype.getValue = function () {
  return this.editor.getValue();
};

module.exports = Editor;
