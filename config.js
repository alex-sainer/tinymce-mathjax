(() => {
    let className = "math-tex";
    if (document.currentScript) {
        let urlParts = document.currentScript.getAttribute("src").split("?");
        if (urlParts[1]) {
            let queryParams = urlParts[1].split("&");
            for (let i = 0; i < queryParams.length; i++) {
                let param = queryParams[i].split("=");
                if (param[0] == "class") {
                    className = param[1];
                    break;
                }
            }
        }
    }

    // MathJax 3.x configuration
    window.MathJax = {
        tex: {
            inlineMath: [["\\(", "\\)"]],
            displayMath: [
                ["$$", "$$"],
                ["\\[", "\\]"],
            ],
        },
        options: {
            processHtmlClass: className + "|" + className + "-original",
            ignoreHtmlClass: "dummy",
        },
        startup: {
            pageReady: () => {
                return MathJax.startup.defaultPageReady().then(() => {
                    // Process any existing math elements
                    if (
                        document.querySelector("." + className) ||
                        document.querySelector("." + className + "-original")
                    ) {
                        MathJax.typesetPromise();
                    }
                });
            },
        },
    };
})();
