#!/bin/bash

npx esbuild ./src/index.mjs --bundle --format=esm >./dist/x-component-all.mjs
npx esbuild ./src/index.mjs --bundle --format=cjs >./dist/x-component-all.js
npx esbuild ./src/index.mjs --bundle --format=esm --minify >./dist/x-component-all.min.mjs
npx esbuild ./src/index.mjs --bundle --format=cjs --minify >./dist/x-component-all.min.js

npx esbuild ./src/x-component.mjs --bundle --format=esm >./dist/x-component.mjs
npx esbuild ./src/x-component.mjs --bundle --format=cjs >./dist/x-component.js
npx esbuild ./src/x-component.mjs --bundle --format=esm --minify >./dist/x-component.min.mjs
npx esbuild ./src/x-component.mjs --bundle --format=cjs --minify >./dist/x-component.min.js

npx esbuild ./src/x-component-data.mjs --bundle --format=esm >./dist/x-component-data.mjs
npx esbuild ./src/x-component-data.mjs --bundle --format=cjs >./dist/x-component-data.js
npx esbuild ./src/x-component-data.mjs --bundle --format=esm --minify >./dist/x-component-data.min.mjs
npx esbuild ./src/x-component-data.mjs --bundle --format=cjs --minify >./dist/x-component-data.min.js
