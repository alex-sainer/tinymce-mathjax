tinymce.PluginManager.add("mathjax", function (editor, url) {
    // Configuration
    const settings = editor.getParam("mathjax") || {};
    const className = settings.className || "math-tex";
    const tempClassName = className + "-original";
    const mathjaxUrl = settings.lib;
    const configUrl = settings.configUrl || `${url}/config.js`;

    // Build script URLs
    const scriptUrls = [configUrl];
    if (settings.className) {
        scriptUrls[0] += `?class=${settings.className}`;
    }
    if (mathjaxUrl) {
        scriptUrls.push(mathjaxUrl);
    }

    // Utility functions
    const waitForMathJax = () => {
        return new Promise((resolve) => {
            if (window.MathJax?.typesetPromise) {
                resolve();
                return;
            }

            const checkMathJax = () => {
                if (window.MathJax?.typesetPromise) {
                    resolve();
                } else {
                    setTimeout(checkMathJax, 100);
                }
            };
            checkMathJax();
        });
    };

    const typesetMathJax = () => {
        const mathJax = editor.getDoc().defaultView.MathJax;
        if (mathJax?.typesetPromise) {
            mathJax.typesetPromise();
        }
    };

    // Element management
    const setupMathElement = (element) => {
        if (element.childNodes.length === 2) return;

        element.setAttribute("contenteditable", "false");
        element.style.cursor = "default";

        const latex = element.getAttribute("data-latex") || element.innerHTML;
        element.setAttribute("data-latex", latex);
        element.innerHTML = "";

        // Create math content span
        const mathSpan = editor.dom.create("span", {
            class: tempClassName,
            innerHTML: latex,
        });
        element.appendChild(mathSpan);

        // Create dummy span for structure
        const dummySpan = editor.dom.create("span", {
            class: "dummy",
            innerHTML: "dummy",
            hidden: "hidden",
        });
        element.appendChild(dummySpan);
    };

    const cleanupMathElement = (element) => {
        const latex = element.getAttribute("data-latex");
        element.removeAttribute("contenteditable");
        element.removeAttribute("style");
        element.removeAttribute("data-latex");
        element.innerHTML = latex;
    };

    // Load MathJax scripts
    const loadMathJaxScripts = () => {
        const existingScripts = editor.getDoc().getElementsByTagName("script");
        const head = editor.getDoc().getElementsByTagName("head")[0];

        scriptUrls.forEach((scriptUrl) => {
            const isLoaded = Array.from(existingScripts).some(
                (script) =>
                    script.src === scriptUrl || script.src.endsWith(scriptUrl.split("/").pop())
            );

            if (!isLoaded) {
                const script = editor.dom.create("script", {
                    type: "text/javascript",
                    src: scriptUrl,
                });
                head.appendChild(script);
            }
        });
    };

    /**
     * rewrite for example $ \alpha $ to <span class="math-tex" data-latex="\( \alpha \)" contenteditable="false" style="cursor: pointer;"><span class="math-tex-original">\( \alpha \)</span><span class="dummy" hidden="hidden">dummy</span></span>
     * @param {string} content
     */
    const rewriteLatexFormulas = (content) => {
        const regexes_complex = [/\$\$([^$]+)\$\$/g];
        regexes_complex.forEach((regex) => {
            content = content.replace(
                regex,
                "<span class='math-tex' data-latex='\\[$1\\]' contenteditable='false' style='cursor: pointer;'><span class='math-tex-original'>\\[$1\\]</span><span class='dummy' hidden='hidden'>dummy</span></span>"
            );
        });

        const regexes_simple = [/\$([^$]+)\$/g];
        regexes_simple.forEach((regex) => {
            content = content.replace(
                regex,
                "<span class='math-tex' data-latex='\\($1\\)' contenteditable='false' style='cursor: pointer;'><span class='math-tex-original'>\\($1\\)</span><span class='dummy' hidden='hidden'>dummy</span></span>"
            );
        });

        return content;
    };

    // Event handlers
    editor.on("init", () => {
        loadMathJaxScripts();
        waitForMathJax().then(typesetMathJax);
    });

    editor.on("GetContent", (e) => {
        const div = editor.dom.create("div");
        div.innerHTML = e.content;

        div.querySelectorAll(`.${className}`).forEach(cleanupMathElement);

        e.content = div.innerHTML;
    });

    editor.on("BeforeSetContent", (e) => {
        const div = editor.dom.create("div");
        div.innerHTML = rewriteLatexFormulas(e.content);

        div.querySelectorAll(`.${className}`).forEach(setupMathElement);

        // TODO: rewrite latex-formulas to "rendered" mathJax-formulas

        e.content = div.innerHTML;
    });

    editor.on("SetContent", () => {
        waitForMathJax().then(typesetMathJax);
    });

    editor.on("Change", () => {
        const elements = editor.dom.getRoot().querySelectorAll(`.${className}`);
        if (elements.length === 0) return;

        elements.forEach(setupMathElement);
        waitForMathJax().then(typesetMathJax);
    });
});
