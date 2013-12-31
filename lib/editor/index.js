var dom = require('dom');
var CodeMirror = require('codemirror');
require('codemirror-mode-javascript')(CodeMirror);

function Editor(emitter) {
  this.emitter = emitter;
  this.container = dom('component-editor');
  this.editor = new CodeMirror(this.find('.editor').get(0), {
    mode:  "javascript"
  });
  this.$bindEvents();
}

Editor.prototype.$bindEvents = function () {
  this.emitter.on('component-debugger:paused', this.$highlightLine.bind(this));
  this.find('.run').on('click', function () {
    this.emitter.emit('component-editor:run', this.getValue());
  }.bind(this));
};

Editor.prototype.$highlightLine = function(lineno) {
  this.find('.highlighted').removeClass('highlighted');
  this
    .find('.CodeMirror-code')
    .find('pre')
    .at(lineno - 1)
    .addClass('selected');
};

Editor.prototype.find = function () {
  return this.container.find.apply(this.container, arguments);
};

Editor.prototype.getValue = function () {
  return this.editor.getValue();
};

module.exports = Editor;
