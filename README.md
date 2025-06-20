# TinyMCE MathJax Plugin

<span class="badge-patreon"><a href="https://www.patreon.com/dimakorotkov" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span><a href="https://buymeacoff.ee/NXR1ZkP" title="Donate to this project using Buy Me A Coffee" rel="nofollow"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg" alt="Buy Me A Coffee donate button"></a></span>

This plugin uses [MathJax](https://www.mathjax.org) library for rendering math formulas in TinyMCE.

This plugin is compatible with **TinyMCE 7** and MathJax 3.

**Note:** This plugin only renders existing MathJax formulas. It does not provide editing functionality - formulas must be added to the content as HTML with the appropriate `data-latex` attributes.

## Install

### NPM:

```
npm i @dimakorotkov/tinymce-mathjax --save
```

You can install mathjax and tinymce from npm

```
npm i mathjax --save
```

```
npm i tinymce --save
```

### Download

-   [Latest build](https://github.com/dimakorotkov/tinymce-mathjax/archive/master.zip)

## Testing

To test the plugin locally:

1. **Install dependencies:**

    ```bash
    npm run setup
    ```

    Or manually:

    ```bash
    npm install tinymce@^7.0.0 mathjax@^3.0.0
    ```

2. **Start the test server:**

    ```bash
    npm test
    ```

    Or manually:

    ```bash
    node server.js
    ```

3. **Alternative servers:**

    ```bash
    # Python
    python -m http.server 8000

    # Node.js (if you have http-server installed)
    npx http-server

    # PHP
    php -S localhost:8000
    ```

4. **Open test files:**
    - `http://localhost:8000/test.html` - Uses local TinyMCE, CDN MathJax
    - `http://localhost:8000/test-local.html` - Uses both TinyMCE and MathJax locally
    - `http://localhost:8000/test-mathjax.html` - MathJax configuration test

## Usage

### TinyMCE editor

Configure your TinyMCE init settings by adding the plugin script:

```html
<!-- Include the plugin script directly -->
<script src="/your-path-to-plugin/@dimakorotkov/tinymce-mathjax/plugin.min.js"></script>
```

```javascript
tinymce.init({
  ...
  plugins: 'mathjax',  // Include in plugins list since script is loaded directly
  mathjax: {
    lib: '/path-to-mathjax/es5/tex-mml-chtml.js', //required path to mathjax
    //className: "math-tex", //optional: mathjax element class
    //configUrl: '/your-path-to-plugin/@dimakorotkov/tinymce-mathjax/config.js' //optional: mathjax config js
  }
});
```

### MathJax Formula Format

The plugin expects MathJax formulas to be in the following HTML format:

```html
<span
    class="math-tex"
    data-latex="\\( x^2 + y^2 = z^2 \\)"
    contenteditable="false"
    style="cursor: default;">
    <span class="math-tex-original">\\( x^2 + y^2 = z^2 \\)</span>
    <span class="dummy" hidden="hidden">dummy</span>
</span>
```

The `data-latex` attribute should contain the LaTeX formula with the appropriate delimiters (e.g., `\\(` and `\\)` for inline math).

### View

For displaying mathjax on web page you have to add [MathJax](https://www.mathjax.org) to the website itself.
It is recommended to include /your-path-to-plugin/@dimakorotkov/tinymce-mathjax/config.js

```html
<script
    src="/your-path-to-plugin/@dimakorotkov/tinymce-mathjax/config.js"
    type="text/javascript"
    charset="utf-8"></script>
<script src="/path-to-mathjax/es5/tex-mml-chtml.js" type="text/javascript" charset="utf-8"></script>
```

You can add an optional param to config.js - class

```html
<script
    src="/your-path-to-plugin/@dimakorotkov/tinymce-mathjax/config.js?class=custom-mathjax-element-class"
    type="text/javascript"
    charset="utf-8"></script>
```

## Migration from TinyMCE 5

If you're upgrading from TinyMCE 5 to TinyMCE 7, this plugin has been updated to be compatible with the new version. The main changes include:

-   Updated plugin structure for TinyMCE 7
-   Improved error handling and null checks
-   Removed editing functionality - now only renders existing formulas
-   Enhanced compatibility with modern JavaScript standards

## License - MIT
