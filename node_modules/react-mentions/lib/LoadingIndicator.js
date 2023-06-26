'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _substyle = require('substyle');

var _substyle2 = _interopRequireDefault(_substyle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function LoadingIndicator(_ref) {
  var style = _ref.style;

  var spinnerStyle = style("spinner");
  return _react2.default.createElement(
    'div',
    style,
    _react2.default.createElement(
      'div',
      spinnerStyle,
      _react2.default.createElement('div', spinnerStyle(["element", "element1"])),
      _react2.default.createElement('div', spinnerStyle(["element", "element2"])),
      _react2.default.createElement('div', spinnerStyle(["element", "element3"])),
      _react2.default.createElement('div', spinnerStyle(["element", "element4"])),
      _react2.default.createElement('div', spinnerStyle(["element", "element5"]))
    )
  );
};

exports.default = (0, _substyle2.default)(LoadingIndicator);