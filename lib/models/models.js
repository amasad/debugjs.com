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
  if (!id) {
    var session = new UserSession({
      files: [
        new File({
          filename: 'index.js',
          text: 'console.log(1)',
          breakpoints: {}
        }),
        new File({
          filename: 'index.html',
          text: '<div>wow</div>',
          breakpoints: {}
        }),
      ]
    });
    cb(session);
  } else {
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
