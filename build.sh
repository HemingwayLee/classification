#!/bin/bash

rm dist/classifier*
browserify src/js/main.js --s classifierjs -o dist/classifier.js
browserify src/js/main.js --s classifierjs | uglifyjs -c > dist/classifier.min.js
# uglifycss src/css/main.css > dist/classifier.min.css

