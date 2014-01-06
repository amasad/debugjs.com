/* global Firebase: false */

var model = require('model');
var defaults = require('model-defaults');

/**
 * @constructor
 */
var UserSession = model('UserSession')
  .attr('files', { required: true });

/**
 * Loads session by id or from starts a new session.
 * @api
 * @param {string} id
 * @param {function} cb
 */
UserSession.loadOrCreateSession = function (id, cb) {
  if (id && id !== 'example') {
    var ref = new Firebase('https://1388566722288.firebaseio.com/' + id);
    ref.on('value', function (s) {
      var files = s.val().map(function (file) {
        return new File(file);
      });
      var session = new UserSession({
        files: files
      });
      cb(session);
    });
  } else {
    var js = new File({
      filename: 'index.js',
      text: '',
      breakpoints: {}
    });
    var html = new File({
      filename: 'index.html',
      text: '',
      breakpoints: {}
    });
    if (id === 'example') {
      js.text(
        ['function randomColor() {',
         '  var n = Math.floor(Math.random() * 16777215);',
         '  return "#" + n.toString(16);',
         '}',
         '',
         'function changeColor() {',
         '  var color = randomColor();',
         '  var elem = document.querySelector(".hello-world");',
         '  elem.style.color = color;',
         '}',
         '',
         'setInterval(changeColor, 250);'
         ].join('\n')
       );
      js.breakpoints({ 6: true });
      html.text('<div class="hello-world">Hello World</div>');
    }
    var session = new UserSession({ files: [js, html] });
    cb(session);
  }
};

var fbase = new Firebase('https://1388566722288.firebaseio.com/');

/**
 * @api
 * @return {object} firebase id object.
 */
UserSession.prototype.save = function () {
  return fbase.push(this.toJSON());
};

/**
 * @api
 * @return {object}
 */
UserSession.prototype.toJSON = function () {
  return this.files().map(function (f) {
    return f.toJSON();
  });
};

/**
 * @constructor
 */
var File = model('File')
  .use(defaults)
  .attr('text', { default: '' })
  .attr('filename', { required: true })
  .attr('breakpoints', { default: [] })
  .attr('cmDoc');

/**
 * @api
 * @return {string} file type
 */
File.prototype.mode = function () {
  var m = this.filename().match(/\.([^\.]+)$/);
  var ext = m && m[1];
  return { 'js': 'javascript', 'html': 'html' }[ext];
};

/**
 * Get breakpoints in a form the debugger understands.
 * @api
 * @return {array<Number>}
 */
File.prototype.debuggerBreakpoints = function () {
  var breakpoints = this.breakpoints();
  return Object.keys(breakpoints).map(function (lno) {
    if (breakpoints[lno]) {
      return parseInt(lno, 10) + 1;
    } else {
      return null;
    }
  }).filter(Boolean);
};

/**
 * @api
 * @return {object}
 */
File.prototype.toJSON = function () {
  return {
    text: this.text(),
    filename: this.filename(),
    breakpoints: this.breakpoints()
  };
};

exports.File = File;
exports.UserSession = UserSession;
