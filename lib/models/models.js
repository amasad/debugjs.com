var model = require('model');
var defaults = require('model-defaults');

var UserSession = model('UserSession')
  .attr('files', { required: true });

UserSession.loadOrCreateSession = function (id, cb) {
  console.log(!!id)
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
        return new File(file)
      });
      var session = new UserSession({
        files: files
      });
      cb(session);
    });
  }
};

/* global Firebase: false */
var fbase = new Firebase('https://1388566722288.firebaseio.com/');

UserSession.prototype.save = function () {
  return fbase.push(this.toJSON());
};

UserSession.prototype.toJSON = function () {
  return this.files().map(function (f) { return f.toJSON(); });
};

var File = model('File')
  .use(defaults)
  .attr('text', { default: '' })
  .attr('filename', { required: true })
  .attr('breakpoints', { default: [] })
  .attr('cmDoc');

File.prototype.mode = function () {
  var m = this.filename().match(/\.([^\.]+)$/);
  var ext = m && m[1];
  return { 'js': 'javascript', 'html': 'html' }[ext];
};

File.prototype.toJSON = function () {
  return {
    text: this.text(),
    filename: this.filename(),
    breakpoints: this.breakpoints()
  };
};

exports.File = File;
exports.UserSession = UserSession;
