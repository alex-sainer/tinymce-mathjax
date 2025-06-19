#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");

console.log("Setting up TinyMCE MathJax Plugin for local testing...\n");

// Check if package.json exists
if (!fs.existsSync("package.json")) {
    console.error(
        "Error: package.json not found. Please run this script from the plugin directory."
    );
    process.exit(1);
}

try {
    // Install TinyMCE locally
    console.log("Installing TinyMCE locally...");
    execSync("npm install tinymce@^7.0.0", { stdio: "inherit" });

    // Install MathJax locally (optional, for offline testing)
    console.log("\nInstalling MathJax locally...");
    execSync("npm install mathjax@^3.0.0", { stdio: "inherit" });

    console.log("\n✅ Setup complete!");
    console.log("\nYou can now:");
    console.log("1. Open test.html in your browser");
    console.log("2. Or serve the files using a local server:");
    console.log("   - Python: python -m http.server 8000");
    console.log("   - Node.js: npx http-server");
    console.log("   - PHP: php -S localhost:8000");
    console.log("\nThen visit: http://localhost:8000/test.html");
} catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    console.log("\nYou can manually install the dependencies:");
    console.log("npm install tinymce@^7.0.0 mathjax@^3.0.0");
    process.exit(1);
}
