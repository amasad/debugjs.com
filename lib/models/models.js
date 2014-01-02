var model = require('model');

var UserSession = model('UserSession')
  .attr('files');

UserSession.loadOrCreateSession = function (cb) {
  var session = new UserSession({
    files: [
      new File({
        filename: 'index.js',
        text: 'console.log(1)'
      }),
      new File({
        filename: 'index.html',
        text: '<div>wow</div>'
      }),
    ]
  });
  cb(session);
};

var File = model('File')
  .attr('text')
  .attr('filename')
  .attr('cmDoc');

File.prototype.mode = function () {
  var m = this.filename().match(/\.([^\.]+)$/);
  var ext = m && m[1];
  return { 'js': 'javascript', 'html': 'html' }[ext];
};

exports.File = File;
exports.UserSession = UserSession;
