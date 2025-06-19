#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 8000;

const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".wav": "audio/wav",
    ".mp4": "video/mp4",
    ".woff": "application/font-woff",
    ".ttf": "application/font-ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".otf": "application/font-otf",
    ".wasm": "application/wasm",
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Default to index.html
    if (pathname === "/") {
        pathname = "/test.html";
    }

    // Get file path
    const filePath = path.join(__dirname, pathname);

    // Get file extension
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || "application/octet-stream";

    // Read file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === "ENOENT") {
                res.writeHead(404);
                res.end("File not found");
            } else {
                res.writeHead(500);
                res.end("Server error: " + err.code);
            }
        } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content, "utf-8");
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Test files available:`);
    console.log(`  - http://localhost:${PORT}/test.html (Local TinyMCE, CDN MathJax)`);
    console.log(`  - http://localhost:${PORT}/test-local.html (Local TinyMCE and MathJax)`);
    console.log(`  - http://localhost:${PORT}/test-offline.html (Completely offline)`);
    console.log(`\nPress Ctrl+C to stop the server`);
});
