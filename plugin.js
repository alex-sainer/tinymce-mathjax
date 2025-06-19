tinymce.PluginManager.add("mathjax", function (editor, url) {
    // plugin configuration options
    let settings = editor.getParam("mathjax");
    let mathjaxClassName = settings.className || "math-tex";
    let mathjaxTempClassName = mathjaxClassName + "-original";
    let mathjaxSymbols = settings.symbols || { start: "\\(", end: "\\)" };
    let mathjaxUrl = settings.lib || null;
    let mathjaxConfigUrl = settings.configUrl || url + "/config.js";
    if (settings.className) {
        mathjaxConfigUrl += "?class=" + settings.className;
    }
    let mathjaxScripts = [mathjaxConfigUrl];
    if (mathjaxUrl) {
        mathjaxScripts.push(mathjaxUrl);
    }

    // Function to wait for MathJax to be ready
    let waitForMathJax = function () {
        return new Promise((resolve) => {
            if (window.MathJax && window.MathJax.typesetPromise) {
                resolve();
            } else {
                const checkMathJax = () => {
                    if (window.MathJax && window.MathJax.typesetPromise) {
                        resolve();
                    } else {
                        setTimeout(checkMathJax, 100);
                        console.log("MathJax is not ready");
                    }
                };
                checkMathJax();
            }
        });
    };

    // load mathjax and its config on editor init
    editor.on("init", function () {
        let scripts = editor.getDoc().getElementsByTagName("script");
        for (let i = 0; i < mathjaxScripts.length; i++) {
            // check if script have already loaded
            let id = editor.dom.uniqueId();
            let script = editor.dom.create("script", {
                id: id,
                type: "text/javascript",
                src: mathjaxScripts[i],
            });
            let found = false;
            for (let j = 0; j < scripts.length; j++) {
                if (scripts[j].src == script.src || scripts[j].src == mathjaxScripts[i]) {
                    found = true;
                    break;
                }
            }
            // load script
            if (!found) {
                editor.getDoc().getElementsByTagName("head")[0].appendChild(script);
            }
        }

        // Wait for MathJax to be ready and then typeset
        waitForMathJax().then(() => {
            if (editor.getDoc().defaultView.MathJax) {
                console.log("MathJax is ready");
                editor.getDoc().defaultView.MathJax.typesetPromise();
            }
        });
    });

    // remove extra tags on get content
    editor.on("GetContent", function (e) {
        let div = editor.dom.create("div");
        div.innerHTML = e.content;
        let elements = div.querySelectorAll("." + mathjaxClassName);
        for (let i = 0; i < elements.length; i++) {
            let children = elements[i].querySelectorAll("span");
            for (let j = 0; j < children.length; j++) {
                children[j].remove();
            }
            let latex = elements[i].getAttribute("data-latex");
            elements[i].removeAttribute("contenteditable");
            elements[i].removeAttribute("style");
            elements[i].removeAttribute("data-latex");
            elements[i].innerHTML = latex;
        }
        e.content = div.innerHTML;
    });

    let checkElement = function (element) {
        if (element.childNodes.length != 2) {
            element.setAttribute("contenteditable", false);
            element.style.cursor = "pointer";
            let latex = element.getAttribute("data-latex") || element.innerHTML;
            element.setAttribute("data-latex", latex);
            element.innerHTML = "";

            // Create the math content span with the LaTeX content
            let math = editor.dom.create("span");
            math.innerHTML = latex;
            math.classList.add(mathjaxTempClassName);
            element.appendChild(math);

            // Create dummy span for structure
            let dummy = editor.dom.create("span");
            dummy.classList.add("dummy");
            dummy.innerHTML = "dummy";
            dummy.setAttribute("hidden", "hidden");
            element.appendChild(dummy);
        }
    };

    // add dummy tag on set content
    editor.on("BeforeSetContent", function (e) {
        let div = editor.dom.create("div");
        div.innerHTML = e.content;
        let elements = div.querySelectorAll("." + mathjaxClassName);
        for (let i = 0; i < elements.length; i++) {
            checkElement(elements[i]);
        }
        e.content = div.innerHTML;
    });

    // refresh mathjax on set content
    editor.on("SetContent", function (e) {
        waitForMathJax().then(() => {
            if (editor.getDoc().defaultView.MathJax) {
                editor.getDoc().defaultView.MathJax.typesetPromise();
            }
        });
    });

    // refresh mathjax on any content change
    editor.on("Change", function (data) {
        let elements = editor.dom.getRoot().querySelectorAll("." + mathjaxClassName);
        if (elements.length) {
            for (let i = 0; i < elements.length; i++) {
                checkElement(elements[i]);
            }
            waitForMathJax().then(() => {
                if (editor.getDoc().defaultView.MathJax) {
                    editor.getDoc().defaultView.MathJax.typesetPromise();
                }
            });
        }
    });

    // add button to tinimce - updated for TinyMCE 7
    editor.ui.registry.addToggleButton("mathjax", {
        text: "Σ",
        tooltip: "Mathjax",
        onAction: function () {
            let selected = editor.selection.getNode();
            let target = undefined;
            if (selected.classList && selected.classList.contains(mathjaxClassName)) {
                target = selected;
            }
            openMathjaxEditor(target);
        },
        onSetup: function (buttonApi) {
            return editor.selection.selectorChangedWithUnbind(
                "." + mathjaxClassName,
                buttonApi.setActive
            ).unbind;
        },
    });

    // handle click on existing
    editor.on("click", function (e) {
        let closest = e.target.closest("." + mathjaxClassName);
        if (closest) {
            openMathjaxEditor(closest);
        }
    });

    // open window with editor - updated for TinyMCE 7
    let openMathjaxEditor = function (target) {
        let mathjaxId = editor.id + "_" + editor.dom.uniqueId();

        let latex = "";
        if (target) {
            let latex_attribute = target.getAttribute("data-latex");
            if (
                latex_attribute &&
                latex_attribute.length >= (mathjaxSymbols.start + mathjaxSymbols.end).length
            ) {
                latex = latex_attribute.substr(
                    mathjaxSymbols.start.length,
                    latex_attribute.length - (mathjaxSymbols.start + mathjaxSymbols.end).length
                );
            }
        }

        // get latex for mathjax from simple text
        let getMathText = function (value, symbols) {
            if (!symbols) {
                symbols = mathjaxSymbols;
            }
            return symbols.start + " " + value + " " + symbols.end;
        };

        // refresh latex in mathjax iframe
        let refreshDialogMathjax = function (latex, iframeId) {
            let iframe = document.getElementById(iframeId);
            if (!iframe) return;

            let iframeWindow =
                iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
            let iframeDocument = iframeWindow.document;
            let iframeBody = iframeDocument.getElementsByTagName("body")[0];
            let MathJax = iframeWindow.MathJax;

            let div = iframeBody.querySelector("div");
            if (!div) {
                div = iframeDocument.createElement("div");
                div.classList.add(mathjaxTempClassName);
                iframeBody.appendChild(div);
            }
            div.innerHTML = getMathText(latex, { start: "$$", end: "$$" });

            // Wait for MathJax to be ready in iframe
            const waitForIframeMathJax = () => {
                return new Promise((resolve) => {
                    if (MathJax && MathJax.typesetPromise) {
                        resolve();
                    } else {
                        const checkMathJax = () => {
                            if (iframeWindow.MathJax && iframeWindow.MathJax.typesetPromise) {
                                resolve();
                            } else {
                                setTimeout(checkMathJax, 100);
                            }
                        };
                        checkMathJax();
                    }
                });
            };

            waitForIframeMathJax().then(() => {
                if (iframeWindow.MathJax) {
                    iframeWindow.MathJax.typesetPromise();
                }
            });
        };

        // show new window - updated for TinyMCE 7
        editor.windowManager.open({
            title: "Mathjax",
            size: "large",
            body: {
                type: "panel",
                items: [
                    {
                        type: "textarea",
                        name: "title",
                        label: "LaTex",
                    },
                    {
                        type: "htmlpanel",
                        html: '<div style="text-align:right"><a href="https://wikibooks.org/wiki/LaTeX/Mathematics" target="_blank" style="font-size:small">LaTex</a></div>',
                    },
                    {
                        type: "htmlpanel",
                        html:
                            '<iframe id="' +
                            mathjaxId +
                            '" style="width: 100%; min-height: 50px;"></iframe>',
                    },
                ],
            },
            buttons: [{ type: "submit", text: "OK" }],
            onSubmit: function onsubmit(api) {
                let value = api.getData().title.trim();
                if (target) {
                    target.innerHTML = "";
                    target.setAttribute("data-latex", getMathText(value));
                    checkElement(target);
                } else {
                    let newElement = editor.getDoc().createElement("span");
                    newElement.innerHTML = getMathText(value);
                    newElement.classList.add(mathjaxClassName);
                    checkElement(newElement);
                    editor.insertContent(newElement.outerHTML);
                }
                waitForMathJax().then(() => {
                    if (editor.getDoc().defaultView.MathJax) {
                        editor.getDoc().defaultView.MathJax.typesetPromise();
                    }
                });
                api.close();
            },
            onChange: function (api) {
                var value = api.getData().title.trim();
                if (value != latex) {
                    refreshDialogMathjax(value, mathjaxId);
                    latex = value;
                }
            },
            initialData: { title: latex },
        });

        // add scripts to iframe
        let iframe = document.getElementById(mathjaxId);
        if (!iframe) return;

        let iframeWindow =
            iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
        let iframeDocument = iframeWindow.document;
        let iframeHead = iframeDocument.getElementsByTagName("head")[0];
        let iframeBody = iframeDocument.getElementsByTagName("body")[0];

        refreshDialogMathjax(latex, mathjaxId);

        // add scripts for dialog iframe
        for (let i = 0; i < mathjaxScripts.length; i++) {
            let node = iframeWindow.document.createElement("script");
            node.src = mathjaxScripts[i];
            node.type = "text/javascript";
            node.async = false;
            node.charset = "utf-8";
            iframeHead.appendChild(node);
        }
    };
});
