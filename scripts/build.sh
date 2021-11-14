#!/bin/bash
mkdir -p dist/

npx esbuild ./src/index.mjs --bundle --format=esm >./dist/x-comp-all.mjs
npx esbuild ./src/index.mjs --bundle --format=cjs >./dist/x-comp-all.js
npx esbuild ./src/index.mjs --bundle --format=esm --minify >./dist/x-comp-all.min.mjs
npx esbuild ./src/index.mjs --bundle --format=cjs --minify >./dist/x-comp-all.min.js

npx esbuild ./src/x-component.mjs --bundle --format=esm >./dist/x-comp.mjs
npx esbuild ./src/x-component.mjs --bundle --format=cjs >./dist/x-comp.js
npx esbuild ./src/x-component.mjs --bundle --format=esm --minify >./dist/x-comp.min.mjs
npx esbuild ./src/x-component.mjs --bundle --format=cjs --minify >./dist/x-comp.min.js

npx esbuild ./src/x-component-data.mjs --bundle --format=esm >./dist/x-comp-data.mjs
npx esbuild ./src/x-component-data.mjs --bundle --format=cjs >./dist/x-comp-data.js
npx esbuild ./src/x-component-data.mjs --bundle --format=esm --minify >./dist/x-comp-data.min.mjs
npx esbuild ./src/x-component-data.mjs --bundle --format=cjs --minify >./dist/x-comp-data.min.js
