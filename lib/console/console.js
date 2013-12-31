var Console = require('console');
var dom = require('dom');

module.exports = function (emitter, debug) {
  var konsole = new Console();
  dom('.component-console').append(konsole.el);
  konsole.on('command', function (val) {
    var frame = debug.machine.getCurrentStackFrame();
    var res;
    try {
      if (frame) {
        res = frame.evalInScope(val);
      } else {
        res = debug.machine.context.evaluate(val);
      }
      konsole.result(res);
    } catch (e) {
      konsole.log(e.name + ': ' + e.message, 'error');
    }
  });
  return konsole;
};
