(() => {
    // Get className from URL parameters
    const getClassNameFromUrl = () => {
        const defaultClassName = "math-tex";

        if (!document.currentScript) {
            return defaultClassName;
        }

        const urlParts = document.currentScript.getAttribute("src").split("?");
        if (urlParts.length < 2) {
            return defaultClassName;
        }

        const queryParams = new URLSearchParams(urlParts[1]);
        return queryParams.get("class") || defaultClassName;
    };

    const className = getClassNameFromUrl();

    // MathJax 3.x configuration
    window.MathJax = {
        tex: {
            inlineMath: [
                ["$", "$"],
                ["\\(", "\\)"],
            ],
            displayMath: [
                ["$$", "$$"],
                ["\\[", "\\]"],
            ],
        },
        options: {
            processHtmlClass: `${className}|${className}-original`,
            ignoreHtmlClass: "dummy",
        },
        startup: {
            pageReady: () => {
                return MathJax.startup.defaultPageReady().then(() => {
                    // Process any existing math elements
                    const hasMathElements =
                        document.querySelector(`.${className}`) ||
                        document.querySelector(`.${className}-original`);
                    if (hasMathElements) {
                        MathJax.typesetPromise();
                    }
                });
            },
        },
    };
})();
