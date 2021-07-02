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

const format = function(html, { sortAttributes = false } = {}) {
  const elements = [];
  const indentSize = 2;

  let currentDepth = 0;

  const increaseCurrentDepth = () => {
    currentDepth++;
  };

  const decreaseCurrentDepth = () => {
    currentDepth--;
  };

  const getIndentation = size => {
    return ' '.repeat(size);
  };

  const getIndentationForDepth = depth => {
    return getIndentation(indentSize * depth);
  };

  const getCurrentIndentation = () => {
    return getIndentationForDepth(currentDepth);
  };

  const getAttributeIndentation = tagName => {
    return getIndentation(indentSize * currentDepth + tagName.length - 1);
  };

  const getAttributeIndentationForCurrentTag = () => {
    return getAttributeIndentation(currentTag);
  };

  const append = content => {
    elements.push(content);
  };

  const appendLineBreak = () => {
    append('\n');
  };

  const appendIndentation = depth => {
    append(getIndentationForDepth(depth));
  };

  const appendCurrentIndentation = () => {
    append(getCurrentIndentation());
  };

  const appendOpeningTag = name => {
    append('<' + name);
  };

  const appendClosingTagOnSameLine = (closeWith = '>') => {
    append(closeWith);
  };

  const appendClosingTagOnNewLine = (closeWith = '>') => {
    appendLineBreak();
    appendIndentation(currentDepth - 1);
    append(closeWith);
  };

  const getAttributeAsString = (name, value) => {
    if (value.length === 0) {
      return name;
    }

    return `${name}="${value}"`;
  };

  const appendAttribute = (name, value) => {
    let attribute = ' ' + name;

    if (value.length > 0) {
      attribute += `="${value}"`;
    }

    append(attribute);
  };

  const appendAttributeOnNewLine = (name, value, tagName) => {
    appendLineBreak();
    append(getAttributeIndentation(tagName));
    appendAttribute(name, value);
  };

  const appendAttributes = (attributes, tagName) => {
    let names = Object.keys(attributes);
    if (sortAttributes) {
      names = names.sort();
    }

    if (names.length === 1) {
      appendAttribute(names[0], attributes[names[0]]);
    }

    if (names.length <= 1) {
      return;
    }

    let firstAttribute = true;
    for (let name of names) {
      if (firstAttribute === true) {
        firstAttribute = false;
        appendAttribute(name, attributes[name]);
      } else {
        appendAttributeOnNewLine(name, attributes[name], tagName);
      }
    }
  };

  const appendClosingTag = (attributes, closeWith) => {
    if (Object.keys(attributes).length <= 1) {
      appendClosingTagOnSameLine(closeWith);

      return;
    }
    appendClosingTagOnNewLine(closeWith);
  };

  const render = () => {
    return elements.join('');
  };

  const isXmlDirective = name => {
    return name === '?xml';
  };

  const isVoidTagName = name => {
    return voidElements.indexOf(name) !== -1;
  };

  // https://www.w3.org/TR/html52/infrastructure.html#space-characters
  // defines "space characters" to include SPACE, TAB, LF, FF, and CR.
  const trimText = text => {
    return text.replace(/^[ \t\n\f\r]+|[ \t\n\f\r]+$/g, '');
  }

  const extractAttributesFromString = content => {
    const attributes = {};

    const pieces = content.split(/\s/);
    // Remove tag name.
    delete pieces[0];

    pieces.forEach(element => {
      if (element.length === 0) {
        return;
      }
      if (element.indexOf('=') === -1) {
        attributes[element] = '';
      }
    });

    const attributesRegex = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/gim;

    let result;
    while ((result = attributesRegex.exec(content))) {
      attributes[result[1]] = result[2];
    }

    return attributes;
  };

  const parser = new Parser(
    {
      onprocessinginstruction: function(name, data) {
        let closingTag = '>';
        if (isXmlDirective(name)) {
          closingTag = '?>';
        }

        appendLineBreak();
        appendCurrentIndentation();
        increaseCurrentDepth();
        appendOpeningTag(name);

        const attributes = extractAttributesFromString(data);
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
        const trimmed = trimText(text);
        if (trimmed.length === 0) {
          return;
        }

        appendLineBreak();
        appendCurrentIndentation();
        append(trimmed);
      },
      onclosetag: function(tagname) {
        const isVoidTag = isVoidTagName(tagname);
        if (isVoidTagName(tagname) === false) {
          appendLineBreak();
        }
        decreaseCurrentDepth();
        if (isVoidTag === true) {
          return;
        }
        appendCurrentIndentation();
        append(`</${tagname}>`);
      },
      oncomment: function(data) {
        // Only display conditional comments.
        if (!data.startsWith('[')) {
          return;
        }
        appendLineBreak();
        appendCurrentIndentation();
        append('<!--');
        append(data);
        append('-->');
      },
    },
    {
      lowerCaseTags: false,
      recognizeSelfClosing: true,
    }
  );
  parser.write(html);
  parser.end();

  appendLineBreak();

  return render();
};

module.exports = format;
