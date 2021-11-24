#!/bin/bash

# rm -r ./dist/
mkdir -p dist/

esbuild ./src/index.mjs --bundle --format=esm >./dist/x-widget-all.mjs
esbuild ./src/index.mjs --bundle --format=cjs >./dist/x-widget-all.js
esbuild ./src/index.mjs --bundle --format=esm --minify >./dist/x-widget-all.min.mjs
esbuild ./src/index.mjs --bundle --format=cjs --minify >./dist/x-widget-all.min.js

esbuild ./src/x-widget.mjs --bundle --format=esm >./dist/x-widget.mjs
esbuild ./src/x-widget.mjs --bundle --format=cjs >./dist/x-widget.js
esbuild ./src/x-widget.mjs --bundle --format=esm --minify >./dist/x-widget.min.mjs
esbuild ./src/x-widget.mjs --bundle --format=cjs --minify >./dist/x-widget.min.js

esbuild ./src/x-widget-data.mjs --bundle --format=esm >./dist/x-widget-data.mjs
esbuild ./src/x-widget-data.mjs --bundle --format=cjs >./dist/x-widget-data.js
esbuild ./src/x-widget-data.mjs --bundle --format=esm --minify >./dist/x-widget-data.min.mjs
esbuild ./src/x-widget-data.mjs --bundle --format=cjs --minify >./dist/x-widget-data.min.js
