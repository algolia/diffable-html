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

test('should not trim Unicode whitespace', () => {
  const html = `<span> \u2009 surrounded  \u2005\u200a  </span>`;

  expect(format(html)).toEqual(
    `
<span>
  \u2009 surrounded  \u2005\u200a
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

test('should not lower case tags', () => {
  const html = `<Span></Span>`;

  expect(format(html)).toEqual(
    `
<Span>
</Span>
`
  );
});

test('should support xml', () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://www.example.com</loc></url><url><loc>https://www.example.com/test</loc></url></urlset>`;

  expect(format(xml)).toEqual(`
<?xml version="1.0"
      encoding="utf-8"
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>
      https://www.example.com
    </loc>
  </url>
  <url>
    <loc>
      https://www.example.com/test
    </loc>
  </url>
</urlset>
`);
});

test('should keep self-closing tags as they are', () => {
  const xml = `<xhtml:link href="https://en.example.com" /><xhtml:link href="https://en.example.com" />`;

  // in the future this should be a self closing tag instead
  // see htmlparser2#69
  expect(format(xml)).toEqual(`
<xhtml:link href="https://en.example.com">
</xhtml:link>
<xhtml:link href="https://en.example.com">
</xhtml:link>
`);
});

test('should support doctype directives', () => {
  const html = `<!doctype html ><html></html>`;
  expect(format(html)).toEqual(`
<!doctype html>
<html>
</html>
`);
});

test('should support html directives', () => {
  const html = `<!doctype html>
<html class="no-js" lang="">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>test</title>
  </head>
  <body>
    <!--[if lte IE 9]>
      <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience and security.</p>
    <![endif]-->

    <!-- Add your site or application content here -->
    <p>Hello world! This is HTML5 Boilerplate.</p>
    <script src="https://code.jquery.com/jquery-{{JQUERY_VERSION}}.min.js" integrity="{{JQUERY_SRI_HASH}}" crossorigin="anonymous"></script>
    <script src="js/plugins.js"></script>
    <script src="js/main.js"></script>

    <!-- Google Analytics: change UA-XXXXX-Y to be your site's ID. -->
    <script>
      window.ga=function(){ga.q.push(arguments)};ga.q=[];ga.l=+new Date;
      ga('create','UA-XXXXX-Y','auto');ga('send','pageview')
    </script>
    <script src="https://www.google-analytics.com/analytics.js" async defer></script>
  </body>
</html>`;

  expect(format(html)).toEqual(`
<!doctype html>
<html class="no-js"
      lang
>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible"
          content="ie=edge"
    >
    <title>
      test
    </title>
  </head>
  <body>
    <!--[if lte IE 9]>
      <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience and security.</p>
    <![endif]-->
    <p>
      Hello world! This is HTML5 Boilerplate.
    </p>
    <script src="https://code.jquery.com/jquery-{{JQUERY_VERSION}}.min.js"
            integrity="{{JQUERY_SRI_HASH}}"
            crossorigin="anonymous"
    >
    </script>
    <script src="js/plugins.js">
    </script>
    <script src="js/main.js">
    </script>
    <script>
      window.ga=function(){ga.q.push(arguments)};ga.q=[];ga.l=+new Date;
      ga('create','UA-XXXXX-Y','auto');ga('send','pageview')
    </script>
    <script src="https://www.google-analytics.com/analytics.js"
            async
            defer
    >
    </script>
  </body>
</html>
`);
});

test('should strip out comments', () => {
  const html = `<p>Start</p><!-- This comment should be removed --><p>End</p>`;

  expect(format(html)).toEqual(
    `
<p>
  Start
</p>
<p>
  End
</p>
`
  );
});

test('should strip out empty comments', () => {
  const html = `<p>Start</p><!----><p>End</p>`;

  expect(format(html)).toEqual(
    `
<p>
  Start
</p>
<p>
  End
</p>
`
  );
});

test('should not strip out conditional comments', () => {
  const html = `<p>Start</p><!--[if IE 9]>.... some HTML here ....<![endif]--><p>End</p>`;

  expect(format(html)).toEqual(
    `
<p>
  Start
</p>
<!--[if IE 9]>.... some HTML here ....<![endif]-->
<p>
  End
</p>
`
  );
});

test('should order attributes alphabetically', () => {
  const html = `<input name="test" value="true" class="form-control">`;

  expect(format(html, { sortAttributes: true })).toEqual(
    `
<input class="form-control"
       name="test"
       value="true"
>
`
  );
});
