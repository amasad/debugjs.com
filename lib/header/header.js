var dom = require('dom');

module.exports = function (emitter, session) {
  dom('header .save').on('click', function () {
    var id = session.save();
    window.location.hash = id.name();
  });

  var files = dom('header .files');
  files.on('click', 'a', function (e) {
    files.find('.active').removeClass('active');
    var el = dom(e.target).parent();
    el.addClass('active');
    emitter.emit('component-header:file select', el.attr('data-filename'));
  });

};
