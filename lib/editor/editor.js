var CodeMirror = require('codemirror');

var dom = require('dom');
var debounce = require('debounce');

require('codemirror-mode-javascript')(CodeMirror);

/**
 * @constructor
 * @param {EventEmitter} emitter
 * @param {array<File>} files
 */
function Editor(emitter, files) {
  this.emitter = emitter;
  this.container = dom('component-editor');
  this.editor = new CodeMirror(this.find('.editor').get(0), {
    gutters: ['CodeMirror-linenumbers', 'breakpoints'],
    lineNumbers: true
  });
  this.$initFiles(files);
  this.editor.on('gutterClick', this.$onGutterClick.bind(this));
  this.editor.on('change', debounce(this.$updateFiles.bind(this)), 50);
  this.emitter.on('component-header:file select', this.$onFileSelect.bind(this));
  this.emitter.on('component-debugger:paused', this.$highlightLine.bind(this));
  this.find('.run').on('click', this.$onRun.bind(this));
}

Editor.prototype.$initFiles = function (files) {
  this.files = files;
  this.files.forEach(function (file) {
    var doc = new CodeMirror.Doc(file.text(), file.mode());
    this.editor.swapDoc(doc);
    var bkpnts = file.breakpoints();
    for (var lineno in bkpnts) {
      this.$setGutterMarker(parseInt(lineno, 10));
    }
    file.cmDoc(doc);
  }, this);
  this.editor.swapDoc(this.files[0].cmDoc());
};

Editor.prototype.$setGutterMarker = function (lineno) {
  var info = this.editor.lineInfo(lineno);
  var marker = info.gutterMarkers ? null : this.$makeMarker();
  this.editor.setGutterMarker(lineno, 'breakpoints', marker);
  return !!marker;
};

Editor.prototype.$onGutterClick = function (_, n) {
  var set = this.$setGutterMarker(n);
  this.$setBreakpoint(this.currentFile(), n, set);
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
  this.emitter.emit('component-editor:run', this.files);
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

Editor.prototype.$setBreakpoint = function(file, lineno, set) {
  if (set) {
    file.breakpoints()[lineno] = true;
    this.emitter.emit('component-editor:breakpoint add', lineno + 1);
  } else {
    file.breakpoints()[lineno] = false;
    this.emitter.emit('component-editor:breakpoint remove', lineno + 1);
  }
};

/**
 * Get the active file.
 * @api
 */
Editor.prototype.currentFile = function() {
  var file;
  var doc = this.editor.getDoc();
  this.files.some(function (f) {
    file = f;
    return f.cmDoc() === doc;
  });
  return file;
};

/**
 * Find an element in the container.
 * @api
 */
Editor.prototype.find = function () {
  return this.container.find.apply(this.container, arguments);
};

/**
 * Get the current editor text.
 * @api
 */
Editor.prototype.getValue = function () {
  return this.editor.getValue();
};

module.exports = Editor;
