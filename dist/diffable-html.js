'use strict';

var htmlparser2 = require('htmlparser2');

// https://www.w3.org/TR/html/syntax.html#writing-html-documents-elements
var voidElements = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'param',
  'source',
  'track',
  'wbr' ];

var format = function(html) {
  var elements = [];
  var indentSize = 2;

  var currentDepth = 0;

  var increaseCurrentDepth = function () {
    currentDepth++;
  };

  var decreaseCurrentDepth = function () {
    currentDepth--;
  };

  var getIndentation = function (size) {
    return ' '.repeat(size);
  };

  var getIndentationForDepth = function (depth) {
    return getIndentation(indentSize * depth);
  };

  var getCurrentIndentation = function () {
    return getIndentationForDepth(currentDepth);
  };

  var getAttributeIndentation = function (tagName) {
    return getIndentation(indentSize * currentDepth + tagName.length - 1);
  };

  var getAttributeIndentationForCurrentTag = function () {
    return getAttributeIndentation(currentTag);
  };

  var append = function (content) {
    elements.push(content);
  };

  var appendLineBreak = function () {
    append('\n');
  };

  var appendIndentation = function (depth) {
    append(getIndentationForDepth(depth));
  };

  var appendCurrentIndentation = function () {
    append(getCurrentIndentation());
  };

  var appendOpeningTag = function (name) {
    append('<' + name);
  };

  var appendClosingTagOnSameLine = function (closeWith) {
    if ( closeWith === void 0 ) closeWith = '>';

    append(closeWith);
  };

  var appendClosingTagOnNewLine = function (closeWith) {
    if ( closeWith === void 0 ) closeWith = '>';

    appendLineBreak();
    appendIndentation(currentDepth - 1);
    append(closeWith);
  };

  var getAttributeAsString = function (name, value) {
    if (value.length === 0) {
      return name;
    }

    return (name + "=\"" + value + "\"");
  };

  var appendAttribute = function (name, value) {
    var attribute = ' ' + name;

    if (value.length > 0) {
      attribute += "=\"" + value + "\"";
    }

    append(attribute);
  };

  var appendAttributeOnNewLine = function (name, value, tagName) {
    appendLineBreak();
    append(getAttributeIndentation(tagName));
    appendAttribute(name, value);
  };

  var appendAttributes = function (attributes, tagName) {
    var names = Object.keys(attributes);

    if (names.length === 1) {
      appendAttribute(names[0], attributes[names[0]]);
    }

    if (names.length <= 1) {
      return;
    }

    var firstAttribute = true;
    for (var name in attributes) {
      if (firstAttribute === true) {
        firstAttribute = false;
        appendAttribute(name, attributes[name]);
      } else {
        appendAttributeOnNewLine(name, attributes[name], tagName);
      }
    }
  };

  var appendClosingTag = function (attributes, closeWith) {
    if (Object.keys(attributes).length <= 1) {
      appendClosingTagOnSameLine(closeWith);

      return;
    }
    appendClosingTagOnNewLine(closeWith);
  };

  var render = function () {
    return elements.join('');
  };

  var isXmlDirective = function (name) {
    return name === '?xml';
  };

  var isVoidTagName = function (name) {
    return voidElements.indexOf(name) !== -1;
  };

  var extractAttributesFromString = function (content) {
    var attributes = {};

    var pieces = content.split(/\s/);
    // Remove tag name.
    delete pieces[0];

    pieces.forEach(function (element) {
      if (element.length === 0) {
        return;
      }
      if (element.indexOf('=') === -1) {
        attributes[element] = '';
      }
    });

    var attributesRegex = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/gim;

    var result;
    while ((result = attributesRegex.exec(content))) {
      attributes[result[1]] = result[2];
    }

    return attributes;
  };

  var parser = new htmlparser2.Parser(
    {
      onprocessinginstruction: function(name, data) {
        var closingTag = '>';
        if (isXmlDirective(name)) {
          closingTag = '?>';
        }

        appendLineBreak();
        appendCurrentIndentation();
        increaseCurrentDepth();
        appendOpeningTag(name);

        var attributes = extractAttributesFromString(data);
        appendAttributes(attributes, name);
        appendClosingTag(attributes, closingTag);
        decreaseCurrentDepth();
      },
      onopentag: function(name, attributes) {
        appendLineBreak();
        appendCurrentIndentation();
        increaseCurrentDepth();
        appendOpeningTag(name);

        appendAttributes(attributes, name);
        appendClosingTag(attributes, '>');
      },
      ontext: function(text) {
        var trimmed = text.trim();
        if (trimmed.length === 0) {
          return;
        }

        appendLineBreak();
        appendCurrentIndentation();
        append(trimmed);
      },
      onclosetag: function(tagname) {
        var isVoidTag = isVoidTagName(tagname);
        if (isVoidTagName(tagname) === false) {
          appendLineBreak();
        }
        decreaseCurrentDepth();
        if (isVoidTag === true) {
          return;
        }
        appendCurrentIndentation();
        append(("</" + tagname + ">"));
      },
      oncomment: function(data) {
        appendLineBreak();
        appendCurrentIndentation();
        append('<!--');
        append(data);
        append('-->');
      },
    },
    {
      lowerCaseTags: false,
    }
  );
  parser.write(html);
  parser.end();

  appendLineBreak();

  return render();
};

module.exports = format;
