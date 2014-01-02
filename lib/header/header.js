var Tip = require('tip');
var Hogan = require('hogan.js');

var dom = require('dom');
var tSave = Hogan.compile(require('./save_template'));

module.exports = function (emitter, session) {
  dom('header .save').on('click', function () {
    var id = session.save();
    window.location.hash = id.name();
    var tip = new Tip(tSave.render({ link: window.location.href }));
    var input = dom(tip.el).find('input').get(0);
    setTimeout(function () {
      var handler = function () {
        tip.hide();
        dom('body').off('click', handler);
      };
      dom('body').on('click', handler);
      input.focus();
      input.select();

    }, 50);
    tip.position('south');
    tip.show(this);
  });

  var files = dom('header .files');
  files.on('click', 'a', function (e) {
    files.find('.active').removeClass('active');
    var el = dom(e.target).parent();
    el.addClass('active');
    emitter.emit('component-header:file select', el.attr('data-filename'));
  });

};
