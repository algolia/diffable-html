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

  var currentIndentation = 0;

  var parser = new htmlparser2.Parser({
    onopentag: function(name, attrs) {
      elements.push('\n');
      elements.push(' '.repeat(indentSize * currentIndentation++));
      elements.push('<' + name);

      var attrsNames = Object.keys(attrs);

      if (attrsNames.length === 1) {
        elements.push((" " + (attrsNames[0]) + "=\"" + (attrs[attrsNames[0]]) + "\""));
      }

      if (attrsNames.length <= 1) {
        elements.push('>');
        return;
      }

      var firstAttribute = true;

      for (var attr in attrs) {
        if (firstAttribute === true) {
          firstAttribute = false;
          elements.push((" " + attr + "=\"" + (attrs[attr]) + "\""));
        } else {
          elements.push('\n');
          elements.push(
            ' '.repeat(indentSize * (currentIndentation - 1) + name.length + 2)
          );
          elements.push((attr + "=\"" + (attrs[attr]) + "\""));
        }
      }
      elements.push('\n');
      elements.push(' '.repeat(indentSize * (currentIndentation - 1)));
      elements.push('>');
    },
    ontext: function(text) {
      var trimmed = text.trim();
      if (trimmed.length === 0) {
        return;
      }

      elements.push('\n');
      elements.push(' '.repeat(indentSize * currentIndentation));
      elements.push(trimmed);
    },
    onclosetag: function(tagname) {
      var isVoidElement = voidElements.indexOf(tagname) !== -1;
      if (isVoidElement === false) {
        elements.push('\n');
      }
      currentIndentation--;
      if (isVoidElement === true) {
        return;
      }
      elements.push(' '.repeat(indentSize * currentIndentation));
      elements.push(("</" + tagname + ">"));
    },
  });
  parser.write(html);
  parser.end();
  elements.push('\n');
  return elements.join('');
};

module.exports = format;
