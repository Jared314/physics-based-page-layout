#Physics Based Page Layout

Physics based layout of HTML DOM elements, with a CSS-like DSL.

##Features
- Standard DOM nodes
- CSS Selectors
- CSS-like DSL

##Live Demo

[jared314.github.io/physics-based-page-layout/](http://jared314.github.io/physics-based-page-layout/)

##How To Use

Include the required script file:

    <script type="text/javascript" src="pbpl.min.js"></script>

Create the desired DOM nodes:

    <div id="item1">Item 1</div>

Attach the springs:

    <style type="text/x-pbpl">
    #item1 {
      spring: top body;
      spring: bottom body;
      spring: left body;
      spring: right body;
    }
    </style>

Please note the value of the`type` attribute of the `style` tag.

##License

The MIT License (MIT)

Copyright (c) 2014 Jared Lobberecht

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
