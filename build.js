#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { minify } = require("terser");

const inputFile = "plugin.js";
const outputFile = "plugin.min.js";

// Parse command line arguments
const args = process.argv.slice(2);
const isProduction = args.includes("--production") || args.includes("-p");
const isVerbose = args.includes("--verbose") || args.includes("-v");
const showHelp = args.includes("--help") || args.includes("-h");

function showUsage() {
    console.log(`
🔨 TinyMCE MathJax Plugin Builder

Usage: npm run build [options]

Options:
  --production, -p    Production build (maximum compression)
  --verbose, -v       Verbose output
  --help, -h          Show this help message

Examples:
  npm run build              # Standard build
  npm run build --production # Maximum compression
  npm run build --verbose    # Verbose output
`);
}

async function buildPlugin() {
    try {
        if (showHelp) {
            showUsage();
            return;
        }

        console.log("🔨 Building TinyMCE MathJax Plugin...");

        // Check if input file exists
        if (!fs.existsSync(inputFile)) {
            throw new Error(`Input file '${inputFile}' not found`);
        }

        // Read the source file
        const sourceCode = fs.readFileSync(inputFile, "utf8");
        const originalSize = fs.statSync(inputFile).size;

        console.log(
            `📖 Read ${inputFile} (${sourceCode.length} characters, ${originalSize} bytes)`
        );

        // Configure minification options based on build mode
        const minifyOptions = {
            compress: {
                drop_console: isProduction, // Remove console.log in production
                drop_debugger: true, // Always remove debugger statements
                pure_funcs: isProduction ? ["console.log", "console.info", "console.debug"] : [], // Remove console functions in production
                passes: isProduction ? 3 : 2, // More passes for production
                dead_code: true, // Remove dead code
                hoist_funs: true, // Hoist function declarations
                hoist_vars: true, // Hoist variable declarations
                if_return: true, // Optimize if-return sequences
                join_vars: true, // Join consecutive variable declarations
                sequences: true, // Use comma operator where possible
                unused: true, // Remove unused variables
            },
            mangle: {
                toplevel: true, // Mangle top-level names
                reserved: ["tinymce", "MathJax"], // Don't mangle important globals
                properties: false, // Don't mangle property names
            },
            format: {
                comments: false, // Remove comments
                beautify: false, // Don't beautify (keep minified)
                indent_level: 0, // No indentation
                semicolons: true, // Keep semicolons
                quote_keys: false, // Don't quote object keys unnecessarily
                ascii_only: false, // Allow non-ASCII characters
                wrap_iife: false, // Don't wrap IIFEs
                max_line_len: 0, // No line length limit
            },
            sourceMap: false, // Don't generate source map
        };

        if (isVerbose) {
            console.log("⚙️  Build options:", JSON.stringify(minifyOptions, null, 2));
        }

        console.log(`⚡ Minifying and uglifying${isProduction ? " (production mode)" : ""}...`);
        const result = await minify(sourceCode, minifyOptions);

        if (result.error) {
            throw new Error(`Minification error: ${result.error.message}`);
        }

        // Write the minified code
        fs.writeFileSync(outputFile, result.code);

        const minifiedSize = fs.statSync(outputFile).size;
        const reduction = (((originalSize - minifiedSize) / originalSize) * 100).toFixed(1);

        console.log(`✅ Build completed successfully!`);
        console.log(
            `📊 Size reduction: ${originalSize} bytes → ${minifiedSize} bytes (${reduction}% smaller)`
        );
        console.log(`📁 Output: ${outputFile}`);

        if (isVerbose) {
            console.log(`\n📋 Build Summary:`);
            console.log(`   Input file: ${inputFile}`);
            console.log(`   Output file: ${outputFile}`);
            console.log(`   Original size: ${originalSize} bytes`);
            console.log(`   Minified size: ${minifiedSize} bytes`);
            console.log(`   Compression ratio: ${reduction}%`);
            console.log(`   Build mode: ${isProduction ? "Production" : "Development"}`);
        }
    } catch (error) {
        console.error("❌ Build failed:", error.message);
        if (isVerbose && error.stack) {
            console.error("Stack trace:", error.stack);
        }
        process.exit(1);
    }
}

// Run the build
buildPlugin();
