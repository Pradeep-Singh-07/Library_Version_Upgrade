'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _substyle = require('substyle');

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

var _keys = require('lodash/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Suggestion = function (_Component) {
  (0, _inherits3.default)(Suggestion, _Component);

  function Suggestion() {
    (0, _classCallCheck3.default)(this, Suggestion);
    return (0, _possibleConstructorReturn3.default)(this, (Suggestion.__proto__ || (0, _getPrototypeOf2.default)(Suggestion)).apply(this, arguments));
  }

  (0, _createClass3.default)(Suggestion, [{
    key: 'render',
    value: function render() {
      var rest = (0, _omit2.default)(this.props, 'style', (0, _keys2.default)(Suggestion.propTypes));

      return _react2.default.createElement(
        'li',
        (0, _extends3.default)({}, rest, this.props.style),
        this.renderContent()
      );
    }
  }, {
    key: 'renderContent',
    value: function renderContent() {
      var _props = this.props,
          id = _props.id,
          query = _props.query,
          descriptor = _props.descriptor,
          suggestion = _props.suggestion,
          index = _props.index;


      var display = this.getDisplay();
      var highlightedDisplay = this.renderHighlightedDisplay(display, query);

      if (descriptor.props.renderSuggestion) {
        return descriptor.props.renderSuggestion(suggestion, query, highlightedDisplay, index);
      }

      return highlightedDisplay;
    }
  }, {
    key: 'getDisplay',
    value: function getDisplay() {
      var suggestion = this.props.suggestion;


      if (suggestion instanceof String) {
        return suggestion;
      }

      var id = suggestion.id,
          display = suggestion.display;


      if (!id || !display) {
        return id;
      }

      return display;
    }
  }, {
    key: 'renderHighlightedDisplay',
    value: function renderHighlightedDisplay(display) {
      var _props2 = this.props,
          query = _props2.query,
          style = _props2.style;


      var i = display.toLowerCase().indexOf(query.toLowerCase());

      if (i === -1) {
        return _react2.default.createElement(
          'span',
          style("display"),
          display
        );
      }

      return _react2.default.createElement(
        'span',
        style("display"),
        display.substring(0, i),
        _react2.default.createElement(
          'b',
          style("highlight"),
          display.substring(i, i + query.length)
        ),
        display.substring(i + query.length)
      );
    }
  }]);
  return Suggestion;
}(_react.Component);

Suggestion.propTypes = {
  id: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]).isRequired,
  query: _propTypes2.default.string.isRequired,
  index: _propTypes2.default.number.isRequired,

  suggestion: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.shape({
    id: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]).isRequired,
    display: _propTypes2.default.string
  })]).isRequired,
  descriptor: _propTypes2.default.object.isRequired,

  focused: _propTypes2.default.bool
};


var styled = (0, _substyle.defaultStyle)({
  cursor: "pointer"
}, function (props) {
  return { "&focused": props.focused };
});

exports.default = styled(Suggestion);