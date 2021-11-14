#!/bin/bash

rm -r ./dist/
mkdir -p dist/

npx esbuild ./src/index.mjs --bundle --format=esm >./dist/x-widget-all.mjs
npx esbuild ./src/index.mjs --bundle --format=cjs >./dist/x-widget-all.js
npx esbuild ./src/index.mjs --bundle --format=esm --minify >./dist/x-widget-all.min.mjs
npx esbuild ./src/index.mjs --bundle --format=cjs --minify >./dist/x-widget-all.min.js

npx esbuild ./src/x-widget.mjs --bundle --format=esm >./dist/x-widget.mjs
npx esbuild ./src/x-widget.mjs --bundle --format=cjs >./dist/x-widget.js
npx esbuild ./src/x-widget.mjs --bundle --format=esm --minify >./dist/x-widget.min.mjs
npx esbuild ./src/x-widget.mjs --bundle --format=cjs --minify >./dist/x-widget.min.js

npx esbuild ./src/x-widget-data.mjs --bundle --format=esm >./dist/x-widget-data.mjs
npx esbuild ./src/x-widget-data.mjs --bundle --format=cjs >./dist/x-widget-data.js
npx esbuild ./src/x-widget-data.mjs --bundle --format=esm --minify >./dist/x-widget-data.min.mjs
npx esbuild ./src/x-widget-data.mjs --bundle --format=cjs --minify >./dist/x-widget-data.min.js
