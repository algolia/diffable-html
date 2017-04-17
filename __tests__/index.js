import format from '../index';

test('should properly nest everything', () => {
  const html = `<ul><li><a href="#">List item 1</a></li><li><a href="#">List item 2</a></li></ul>`;

  expect(format(html)).toEqual(
    `
<ul>
  <li>
    <a href="#">
      List item 1
    </a>
  </li>
  <li>
    <a href="#">
      List item 2
    </a>
  </li>
</ul>
`
  );
});

test('should align attributes vertically', () => {
  const html = `<input name="test" value="true" class="form-control">`;

  expect(format(html)).toEqual(
    `
<input name="test"
       value="true"
       class="form-control"
>
`
  );
});

test('should close tag on the same line if there is only one attribute', () => {
  const html = `<input  name="test" >`;

  expect(format(html)).toEqual(
    `
<input name="test">
`
  );
});

test('should not decode entities', () => {
  const html = `<div>&nbsp;</div>`;

  expect(format(html)).toEqual(
    `
<div>
  &nbsp;
</div>
`
  );
});

test('should trim text nodes', () => {
  const html = `<span> surrounded    </span>`;

  expect(format(html)).toEqual(
    `
<span>
  surrounded
</span>
`
  );
});

test('should not introduce line break if text node is empty', () => {
  const html = `<span>     </span>`;

  expect(format(html)).toEqual(
    `
<span>
</span>
`
  );
});
