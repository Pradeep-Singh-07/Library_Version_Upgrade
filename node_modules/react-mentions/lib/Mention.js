'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _substyle = require('substyle');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styled = (0, _substyle.defaultStyle)({
  fontWeight: "inherit"
});

var Mention = styled(function (_ref) {
  var display = _ref.display,
      style = _ref.style;
  return _react2.default.createElement(
    'strong',
    style,
    display
  );
});

Mention.propTypes = {
  /**
   * Called when a new mention is added in the input
   *
   * Example:
   *
   * ```js
   * function(id, display) {
   *   console.log("user " + display + " was mentioned!");
   * }
   * ```
   */
  onAdd: _propTypes2.default.func,
  onRemove: _propTypes2.default.func,

  renderSuggestion: _propTypes2.default.func,

  trigger: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.instanceOf(RegExp)]),

  isLoading: _propTypes2.default.bool
};

Mention.defaultProps = {
  trigger: "@",

  onAdd: function onAdd() {
    return null;
  },
  onRemove: function onRemove() {
    return null;
  },
  renderSuggestion: null,
  isLoading: false,
  appendSpaceOnAdd: false
};

exports.default = Mention;