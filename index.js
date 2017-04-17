import { Parser } from 'htmlparser2';

// https://www.w3.org/TR/html/syntax.html#writing-html-documents-elements
const voidElements = [
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
  'wbr',
];

const format = function(html) {
  const elements = [];
  const indentSize = 2;

  let currentIndentation = 0;

  const parser = new Parser({
    onopentag: function(name, attrs) {
      elements.push('\n');
      elements.push(' '.repeat(indentSize * currentIndentation++));
      elements.push('<' + name);

      const attrsNames = Object.keys(attrs);

      if (attrsNames.length === 1) {
        elements.push(` ${attrsNames[0]}="${attrs[attrsNames[0]]}"`);
      }

      if (attrsNames.length <= 1) {
        elements.push('>');
        return;
      }

      let firstAttribute = true;

      for (let attr in attrs) {
        if (firstAttribute === true) {
          firstAttribute = false;
          elements.push(` ${attr}="${attrs[attr]}"`);
        } else {
          elements.push('\n');
          elements.push(
            ' '.repeat(indentSize * (currentIndentation - 1) + name.length + 2)
          );
          elements.push(`${attr}="${attrs[attr]}"`);
        }
      }
      elements.push('\n');
      elements.push(' '.repeat(indentSize * (currentIndentation - 1)));
      elements.push('>');
    },
    ontext: function(text) {
      const trimmed = text.trim();
      if (trimmed.length === 0) {
        return;
      }

      elements.push('\n');
      elements.push(' '.repeat(indentSize * currentIndentation));
      elements.push(trimmed);
    },
    onclosetag: function(tagname) {
      const isVoidElement = voidElements.indexOf(tagname) !== -1;
      if (isVoidElement === false) {
        elements.push('\n');
      }
      currentIndentation--;
      if (isVoidElement === true) {
        return;
      }
      elements.push(' '.repeat(indentSize * currentIndentation));
      elements.push(`</${tagname}>`);
    },
  });
  parser.write(html);
  parser.end();
  elements.push('\n');
  return elements.join('');
};

module.exports = format;
