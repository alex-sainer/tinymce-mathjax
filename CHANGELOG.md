# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-01-XX

### Changed

-   **BREAKING**: Updated plugin to be compatible with TinyMCE 7
-   Updated plugin structure to use modern TinyMCE 7 APIs
-   Improved error handling with null checks for better stability
-   Updated dialog window configuration to use `size: 'large'` instead of fixed width/height
-   Enhanced compatibility with modern JavaScript standards
-   Added proper variable declarations with `let` instead of implicit globals
-   Improved iframe handling in dialog with better error checking

### Fixed

-   Fixed potential null reference errors when accessing element properties
-   Improved MathJax integration stability
-   Enhanced dialog refresh functionality

### Added

-   Added peer dependency specification for TinyMCE 7
-   Added comprehensive test file for verification
-   Updated documentation with TinyMCE 7 compatibility notes
-   Added migration guide section in README

### Technical Details

-   Replaced deprecated TinyMCE 5 APIs with TinyMCE 7 equivalents
-   Updated window manager configuration to use new size options
-   Improved function scoping and variable declarations
-   Enhanced MathJax typeset promise handling with proper checks

## [1.0.11] - Previous Version

### Compatible with

-   TinyMCE 5.x
-   MathJax 3.x
