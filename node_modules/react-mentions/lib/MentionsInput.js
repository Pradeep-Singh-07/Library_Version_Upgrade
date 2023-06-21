'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._getTriggerRegex = undefined;

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

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _keys = require('lodash/keys');

var _keys2 = _interopRequireDefault(_keys);

var _values = require('lodash/values');

var _values2 = _interopRequireDefault(_values);

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _substyle = require('substyle');

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _SuggestionsOverlay = require('./SuggestionsOverlay');

var _SuggestionsOverlay2 = _interopRequireDefault(_SuggestionsOverlay);

var _Highlighter = require('./Highlighter');

var _Highlighter2 = _interopRequireDefault(_Highlighter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _getTriggerRegex = exports._getTriggerRegex = function _getTriggerRegex(trigger) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (trigger instanceof RegExp) {
    return trigger;
  } else {
    var allowSpaceInQuery = options.allowSpaceInQuery;

    var escapedTriggerChar = _utils2.default.escapeRegex(trigger);

    // first capture group is the part to be replaced on completion
    // second capture group is for extracting the search query
    return new RegExp('(?:^|\\s)(' + escapedTriggerChar + '([^' + (allowSpaceInQuery ? '' : '\\s') + escapedTriggerChar + ']*))$');
  }
};

var _getDataProvider = function _getDataProvider(data) {
  if (data instanceof Array) {
    // if data is an array, create a function to query that
    return function (query, callback) {
      var results = [];
      for (var i = 0, l = data.length; i < l; ++i) {
        var display = data[i].display || data[i].id;
        if (display.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
          results.push(data[i]);
        }
      }
      return results;
    };
  } else {
    // expect data to be a query function
    return data;
  }
};

var KEY = { TAB: 9, RETURN: 13, ESC: 27, UP: 38, DOWN: 40 };

var isComposing = false;

var MentionsInput = function (_React$Component) {
  (0, _inherits3.default)(MentionsInput, _React$Component);

  function MentionsInput(props) {
    (0, _classCallCheck3.default)(this, MentionsInput);

    var _this = (0, _possibleConstructorReturn3.default)(this, (MentionsInput.__proto__ || (0, _getPrototypeOf2.default)(MentionsInput)).call(this, props));

    _initialiseProps.call(_this);

    _this.suggestions = {};

    _this.state = {
      focusIndex: 0,

      selectionStart: null,
      selectionEnd: null,

      suggestions: {},

      caretPosition: null,
      suggestionsPosition: null
    };
    return _this;
  }

  (0, _createClass3.default)(MentionsInput, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        (0, _extends3.default)({ ref: 'container' }, this.props.style),
        this.renderControl(),
        this.renderSuggestionsOverlay()
      );
    }

    // Returns the text to set as the value of the textarea with all markups removed


    // Handle input element's change event


    // Handle input element's select event

  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.updateSuggestionsPosition();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.updateSuggestionsPosition();

      // maintain selection in case a mention is added/removed causing
      // the cursor to jump to the end
      if (this.state.setSelectionAfterMentionChange) {
        this.setState({ setSelectionAfterMentionChange: false });
        this.setSelection(this.state.selectionStart, this.state.selectionEnd);
      }
    }
  }]);
  return MentionsInput;
}(_react2.default.Component);

MentionsInput.propTypes = {
  /**
   * If set to `true` a regular text input element will be rendered
   * instead of a textarea
   */
  singleLine: _propTypes2.default.bool,

  /**
   * If set to `true` spaces will not interrupt matching suggestions
   */
  allowSpaceInQuery: _propTypes2.default.bool,

  markup: _propTypes2.default.string,
  value: _propTypes2.default.string,

  displayTransform: _propTypes2.default.func,
  onKeyDown: _propTypes2.default.func,
  onSelect: _propTypes2.default.func,
  onBlur: _propTypes2.default.func,
  onChange: _propTypes2.default.func,

  children: _propTypes2.default.oneOfType([_propTypes2.default.element, _propTypes2.default.arrayOf(_propTypes2.default.element)]).isRequired
};
MentionsInput.defaultProps = {
  markup: "@[__display__](__id__)",
  singleLine: false,
  displayTransform: function displayTransform(id, display, type) {
    return display;
  },
  onKeyDown: function onKeyDown() {
    return null;
  },
  onSelect: function onSelect() {
    return null;
  },
  onBlur: function onBlur() {
    return null;
  }
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.getInputProps = function (isTextarea) {
    var _props = _this2.props,
        readOnly = _props.readOnly,
        disabled = _props.disabled,
        style = _props.style;

    // pass all props that we don't use through to the input control

    var props = (0, _omit2.default)(_this2.props, 'style', (0, _keys2.default)(MentionsInput.propTypes));

    return (0, _extends3.default)({}, props, style("input"), {

      value: _this2.getPlainText()

    }, !readOnly && !disabled && {
      onChange: _this2.handleChange,
      onSelect: _this2.handleSelect,
      onKeyDown: _this2.handleKeyDown,
      onBlur: _this2.handleBlur,
      onCompositionStart: _this2.handleCompositionStart,
      onCompositionEnd: _this2.handleCompositionEnd
    });
  };

  this.renderControl = function () {
    var _props2 = _this2.props,
        singleLine = _props2.singleLine,
        style = _props2.style;

    var inputProps = _this2.getInputProps(!singleLine);

    return _react2.default.createElement(
      'div',
      style("control"),
      _this2.renderHighlighter(inputProps.style),
      singleLine ? _this2.renderInput(inputProps) : _this2.renderTextarea(inputProps)
    );
  };

  this.renderInput = function (props) {
    return _react2.default.createElement('input', (0, _extends3.default)({
      type: 'text',
      ref: 'input'
    }, props));
  };

  this.renderTextarea = function (props) {
    return _react2.default.createElement('textarea', (0, _extends3.default)({
      ref: 'input'
    }, props));
  };

  this.renderSuggestionsOverlay = function () {
    if (!_utils2.default.isNumber(_this2.state.selectionStart)) {
      // do not show suggestions when the input does not have the focus
      return null;
    }
    return _react2.default.createElement(_SuggestionsOverlay2.default, {
      style: _this2.props.style("suggestions"),
      position: _this2.state.suggestionsPosition,
      focusIndex: _this2.state.focusIndex,
      scrollFocusedIntoView: _this2.state.scrollFocusedIntoView,
      ref: 'suggestions',
      suggestions: _this2.state.suggestions,
      onSelect: _this2.addMention,
      onMouseDown: _this2.handleSuggestionsMouseDown,
      onMouseEnter: function onMouseEnter(focusIndex) {
        return _this2.setState({
          focusIndex: focusIndex,
          scrollFocusedIntoView: false
        });
      },
      isLoading: _this2.isLoading() });
  };

  this.renderHighlighter = function (inputStyle) {
    var _state = _this2.state,
        selectionStart = _state.selectionStart,
        selectionEnd = _state.selectionEnd;
    var _props3 = _this2.props,
        markup = _props3.markup,
        displayTransform = _props3.displayTransform,
        singleLine = _props3.singleLine,
        children = _props3.children,
        value = _props3.value,
        style = _props3.style;


    return _react2.default.createElement(
      _Highlighter2.default,
      {
        ref: 'highlighter',
        style: style("highlighter"),
        inputStyle: inputStyle,
        value: value,
        markup: markup,
        displayTransform: displayTransform,
        singleLine: singleLine,
        selection: {
          start: selectionStart,
          end: selectionEnd
        },
        onCaretPositionChange: function onCaretPositionChange(position) {
          return _this2.setState({ caretPosition: position });
        } },
      children
    );
  };

  this.getPlainText = function () {
    return _utils2.default.getPlainText(_this2.props.value || "", _this2.props.markup, _this2.props.displayTransform);
  };

  this.executeOnChange = function (event) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (_this2.props.onChange) {
      var _props4;

      return (_props4 = _this2.props).onChange.apply(_props4, [event].concat(args));
    }

    if (_this2.props.valueLink) {
      var _props$valueLink;

      return (_props$valueLink = _this2.props.valueLink).requestChange.apply(_props$valueLink, [event.target.value].concat(args));
    }
  };

  this.handleChange = function (ev) {
    // if we are inside iframe, we need to find activeElement within its contentDocument
    var currentDocument = document.activeElement && document.activeElement.contentDocument || document;
    if (currentDocument.activeElement !== ev.target) {
      // fix an IE bug (blur from empty input element with placeholder attribute trigger "input" event)
      return;
    }

    var value = _this2.props.value || "";
    var newPlainTextValue = ev.target.value;

    // Derive the new value to set by applying the local change in the textarea's plain text
    var newValue = _utils2.default.applyChangeToValue(value, _this2.props.markup, newPlainTextValue, _this2.state.selectionStart, _this2.state.selectionEnd, ev.target.selectionEnd, _this2.props.displayTransform);

    // In case a mention is deleted, also adjust the new plain text value
    newPlainTextValue = _utils2.default.getPlainText(newValue, _this2.props.markup, _this2.props.displayTransform);

    // Save current selection after change to be able to restore caret position after rerendering
    var selectionStart = ev.target.selectionStart;
    var selectionEnd = ev.target.selectionEnd;
    var setSelectionAfterMentionChange = false;

    // Adjust selection range in case a mention will be deleted by the characters outside of the
    // selection range that are automatically deleted
    var startOfMention = _utils2.default.findStartOfMentionInPlainText(value, _this2.props.markup, selectionStart, _this2.props.displayTransform);

    if (startOfMention !== undefined && _this2.state.selectionEnd > startOfMention) {
      // only if a deletion has taken place
      selectionStart = startOfMention;
      selectionEnd = selectionStart;
      setSelectionAfterMentionChange = true;
    }

    _this2.setState({
      selectionStart: selectionStart,
      selectionEnd: selectionEnd,
      setSelectionAfterMentionChange: setSelectionAfterMentionChange
    });

    var mentions = _utils2.default.getMentions(newValue, _this2.props.markup);

    // Propagate change
    // let handleChange = this.getOnChange(this.props) || emptyFunction;
    var eventMock = { target: { value: newValue } };
    // this.props.onChange.call(this, eventMock, newValue, newPlainTextValue, mentions);
    _this2.executeOnChange(eventMock, newValue, newPlainTextValue, mentions);
  };

  this.handleSelect = function (ev) {
    // do nothing while a IME composition session is active
    if (isComposing) return;

    // keep track of selection range / caret position
    _this2.setState({
      selectionStart: ev.target.selectionStart,
      selectionEnd: ev.target.selectionEnd
    });

    // refresh suggestions queries
    var el = _this2.refs.input;
    if (ev.target.selectionStart === ev.target.selectionEnd) {
      _this2.updateMentionsQueries(el.value, ev.target.selectionStart);
    } else {
      _this2.clearSuggestions();
    }

    // sync highlighters scroll position
    _this2.updateHighlighterScroll();

    _this2.props.onSelect(ev);
  };

  this.handleKeyDown = function (ev) {
    // do not intercept key events if the suggestions overlay is not shown
    var suggestionsCount = _utils2.default.countSuggestions(_this2.state.suggestions);

    var suggestionsComp = _this2.refs.suggestions;
    if (suggestionsCount === 0 || !suggestionsComp) {
      _this2.props.onKeyDown(ev);

      return;
    }

    if ((0, _values2.default)(KEY).indexOf(ev.keyCode) >= 0) {
      ev.preventDefault();
    }

    switch (ev.keyCode) {
      case KEY.ESC:
        {
          _this2.clearSuggestions();
          return;
        }
      case KEY.DOWN:
        {
          _this2.shiftFocus(+1);
          return;
        }
      case KEY.UP:
        {
          _this2.shiftFocus(-1);
          return;
        }
      case KEY.RETURN:
        {
          _this2.selectFocused();
          return;
        }
      case KEY.TAB:
        {
          _this2.selectFocused();
          return;
        }
    }
  };

  this.shiftFocus = function (delta) {
    var suggestionsCount = _utils2.default.countSuggestions(_this2.state.suggestions);

    _this2.setState({
      focusIndex: (suggestionsCount + _this2.state.focusIndex + delta) % suggestionsCount,
      scrollFocusedIntoView: true
    });
  };

  this.selectFocused = function () {
    var _state2 = _this2.state,
        suggestions = _state2.suggestions,
        focusIndex = _state2.focusIndex;

    var _utils$getSuggestion = _utils2.default.getSuggestion(suggestions, focusIndex),
        suggestion = _utils$getSuggestion.suggestion,
        descriptor = _utils$getSuggestion.descriptor;

    _this2.addMention(suggestion, descriptor);

    _this2.setState({
      focusIndex: 0
    });
  };

  this.handleBlur = function (ev) {
    var clickedSuggestion = _this2._suggestionsMouseDown;
    _this2._suggestionsMouseDown = false;

    // only reset selection if the mousedown happened on an element
    // other than the suggestions overlay
    if (!clickedSuggestion) {
      _this2.setState({
        selectionStart: null,
        selectionEnd: null
      });
    };

    window.setTimeout(function () {
      _this2.updateHighlighterScroll();
    }, 1);

    _this2.props.onBlur(ev, clickedSuggestion);
  };

  this.handleSuggestionsMouseDown = function (ev) {
    _this2._suggestionsMouseDown = true;
  };

  this.updateSuggestionsPosition = function () {
    var caretPosition = _this2.state.caretPosition;


    if (!caretPosition || !_this2.refs.suggestions) {
      return;
    }

    var container = _this2.refs.container;


    var suggestions = _reactDom2.default.findDOMNode(_this2.refs.suggestions);
    var highlighter = _reactDom2.default.findDOMNode(_this2.refs.highlighter);

    if (!suggestions) {
      return;
    }

    var left = caretPosition.left - highlighter.scrollLeft;
    var position = {};

    // guard for mentions suggestions list clipped by right edge of window
    if (left + suggestions.offsetWidth > container.offsetWidth) {
      position.right = 0;
    } else {
      position.left = left;
    }

    position.top = caretPosition.top - highlighter.scrollTop;

    if ((0, _isEqual2.default)(position, _this2.state.suggestionsPosition)) {
      return;
    }

    _this2.setState({
      suggestionsPosition: position
    });
  };

  this.updateHighlighterScroll = function () {
    if (!_this2.refs.input || !_this2.refs.highlighter) {
      // since the invocation of this function is deferred,
      // the whole component may have been unmounted in the meanwhile
      return;
    }
    var input = _this2.refs.input;
    var highlighter = _reactDom2.default.findDOMNode(_this2.refs.highlighter);
    highlighter.scrollLeft = input.scrollLeft;
  };

  this.handleCompositionStart = function () {
    isComposing = true;
  };

  this.handleCompositionEnd = function () {
    isComposing = false;
  };

  this.setSelection = function (selectionStart, selectionEnd) {
    if (selectionStart === null || selectionEnd === null) return;

    var el = _this2.refs.input;
    if (el.setSelectionRange) {
      el.setSelectionRange(selectionStart, selectionEnd);
    } else if (el.createTextRange) {
      var range = el.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    }
  };

  this.updateMentionsQueries = function (plainTextValue, caretPosition) {
    // Invalidate previous queries. Async results for previous queries will be neglected.
    _this2._queryId++;
    _this2.suggestions = {};
    _this2.setState({
      suggestions: {}
    });

    var value = _this2.props.value || "";
    var positionInValue = _utils2.default.mapPlainTextIndex(value, _this2.props.markup, caretPosition, 'NULL', _this2.props.displayTransform);

    // If caret is inside of mention, do not query
    if (positionInValue === null) {
      return;
    }

    // Extract substring in between the end of the previous mention and the caret
    var substringStartIndex = _utils2.default.getEndOfLastMention(value.substring(0, positionInValue), _this2.props.markup, _this2.props.displayTransform);
    var substring = plainTextValue.substring(substringStartIndex, caretPosition);

    // Check if suggestions have to be shown:
    // Match the trigger patterns of all Mention children on the extracted substring
    _react2.default.Children.forEach(_this2.props.children, function (child) {
      if (!child) {
        return;
      }

      var regex = _getTriggerRegex(child.props.trigger, _this2.props);
      var match = substring.match(regex);
      if (match) {
        var querySequenceStart = substringStartIndex + substring.indexOf(match[1], match.index);
        _this2.queryData(match[2], child, querySequenceStart, querySequenceStart + match[1].length, plainTextValue);
      }
    });
  };

  this.clearSuggestions = function () {
    // Invalidate previous queries. Async results for previous queries will be neglected.
    _this2._queryId++;
    _this2.suggestions = {};
    _this2.setState({
      suggestions: {},
      focusIndex: 0
    });
  };

  this.queryData = function (query, mentionDescriptor, querySequenceStart, querySequenceEnd, plainTextValue) {
    var provideData = _getDataProvider(mentionDescriptor.props.data);
    var snycResult = provideData(query, _this2.updateSuggestions.bind(null, _this2._queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, plainTextValue));
    if (snycResult instanceof Array) {
      _this2.updateSuggestions(_this2._queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, plainTextValue, snycResult);
    }
  };

  this.updateSuggestions = function (queryId, mentionDescriptor, query, querySequenceStart, querySequenceEnd, plainTextValue, suggestions) {
    // neglect async results from previous queries
    if (queryId !== _this2._queryId) return;

    var update = {};
    update[mentionDescriptor.props.type] = {
      query: query,
      mentionDescriptor: mentionDescriptor,
      querySequenceStart: querySequenceStart,
      querySequenceEnd: querySequenceEnd,
      results: suggestions,
      plainTextValue: plainTextValue
    };

    // save in property so that multiple sync state updates from different mentions sources
    // won't overwrite each other
    _this2.suggestions = _utils2.default.extend({}, _this2.suggestions, update);

    var focusIndex = _this2.state.focusIndex;

    var suggestionsCount = _utils2.default.countSuggestions(_this2.suggestions);
    _this2.setState({
      suggestions: _this2.suggestions,
      focusIndex: focusIndex >= suggestionsCount ? Math.max(suggestionsCount - 1, 0) : focusIndex
    });
  };

  this.addMention = function (suggestion, _ref2) {
    var mentionDescriptor = _ref2.mentionDescriptor,
        querySequenceStart = _ref2.querySequenceStart,
        querySequenceEnd = _ref2.querySequenceEnd,
        plainTextValue = _ref2.plainTextValue;

    // Insert mention in the marked up value at the correct position
    var value = _this2.props.value || "";
    var start = _utils2.default.mapPlainTextIndex(value, _this2.props.markup, querySequenceStart, 'START', _this2.props.displayTransform);
    var end = start + querySequenceEnd - querySequenceStart;
    var insert = _utils2.default.makeMentionsMarkup(_this2.props.markup, suggestion.id, suggestion.display, mentionDescriptor.props.type);
    if (mentionDescriptor.props.appendSpaceOnAdd) {
      insert = insert + ' ';
    }
    var newValue = _utils2.default.spliceString(value, start, end, insert);

    // Refocus input and set caret position to end of mention
    _this2.refs.input.focus();

    var displayValue = _this2.props.displayTransform(suggestion.id, suggestion.display, mentionDescriptor.props.type);
    if (mentionDescriptor.props.appendSpaceOnAdd) {
      displayValue = displayValue + ' ';
    }
    var newCaretPosition = querySequenceStart + displayValue.length;
    _this2.setState({
      selectionStart: newCaretPosition,
      selectionEnd: newCaretPosition,
      setSelectionAfterMentionChange: true
    });

    // Propagate change
    var eventMock = { target: { value: newValue } };
    var mentions = _utils2.default.getMentions(newValue, _this2.props.markup);
    var newPlainTextValue = _utils2.default.spliceString(plainTextValue, querySequenceStart, querySequenceEnd, displayValue);

    _this2.executeOnChange(eventMock, newValue, newPlainTextValue, mentions);

    var onAdd = mentionDescriptor.props.onAdd;
    if (onAdd) {
      onAdd(suggestion.id, suggestion.display);
    }

    // Make sure the suggestions overlay is closed
    _this2.clearSuggestions();
  };

  this.isLoading = function () {
    var isLoading = false;
    _react2.default.Children.forEach(_this2.props.children, function (child) {
      isLoading = isLoading || child && child.props.isLoading;
    });
    return isLoading;
  };

  this._queryId = 0;
};

var isMobileSafari = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

var styled = (0, _substyle.defaultStyle)({
  position: "relative",
  overflowY: "visible",

  input: {
    display: "block",
    position: "absolute",

    top: 0,

    boxSizing: "border-box",

    backgroundColor: "transparent",

    width: "inherit"
  },

  '&multiLine': {
    input: (0, _extends3.default)({
      width: "100%",
      height: "100%",
      bottom: 0,
      overflow: "hidden",
      resize: "none"

    }, isMobileSafari ? {
      marginTop: 1,
      marginLeft: -3
    } : null)
  }
}, function (_ref) {
  var singleLine = _ref.singleLine;
  return {
    "&singleLine": singleLine,
    "&multiLine": !singleLine
  };
});

exports.default = styled(MentionsInput);