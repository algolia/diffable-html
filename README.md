# Opinionated HTML formatter focused towards making HTML diffs readable.

[![NPM version](https://badge.fury.io/js/diffable-html.svg)](https://yarnpkg.org/en/package/diffable-html)
[![Build Status](https://travis-ci.org/rayrutjes/diffable-html.svg?branch=master)](https://travis-ci.org/rayrutjes/diffable-html)

This formatter will normalize your HTML in a way that when you diff it, you get a clear sense of what changed.

This is a "zero-config" and opinionated HTML formatter. Default rules might change in future releases in which case we will push a major release.

Feel free to open issues to discuss better defaults.

Formatting consists of:
- indenting every level with 2 spaces
- align attributes
- put every opening and closing tag on its own line
- trimming text nodes

*Be aware that this plugin is intended for making HTML diffs more readable.
We took the compromise of not dealing with white-spaces like the browsers do.*

## Install

Add the package as a dev-dependency:

```bash
# With npm
npm install --save-dev diffable-html

# With yarn
yarn add --dev diffable-html
```


## Example

```js
import toDiffableHtml from 'diffable-html';

const html = `
<div id="header">
  <h1>Hello World!</h1>
  <ul id="main-list" class="list"><li><a href="#">My HTML</a></li></ul>
</div>
`

console.log(toDiffableHtml(html));
```

Will output:

```html
<div id="header">
  <h1>
    Hello World!
  </h1>
  <ul id="main-list"
      class="list"
  >
    <li>
      <a href="#">
        My HTML
      </a>
    </li>
  </ul>
</div>
```

## Yet another HTML formatting plugin?

This formatter was initially developed to address the lack of some features in [js-beautifier](https://github.com/beautify-web/js-beautify):

- Put the inner content of each tag on its own line (beautify-web/js-beautify#980)
- Put closing bracket on its own line (beautify-web/js-beautify#937)
- Indent every text node

These features are needed to improve readability of HTML diffs.

## Usage with Jest

Development of this plugin was motivated by making testing of Vue.js components easier
by the use of [Jest with snapshot tests](https://facebook.github.io/jest/docs/snapshot-testing.html).

You can find a serializer for formatting your HTML here [Jest serializer](https://github.com/rayrutjes/jest-serializer-html).
