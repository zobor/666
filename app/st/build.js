const sass = require('node-sass');
const fs = require('fs');
const path = require('path');
const file = path.resolve("./src/index.scss");

fs.writeFileSync('./src/index.css', sass.renderSync({ file }).css.toString());
fs.writeFileSync('./html/index-prod.html', fs.readFileSync('./html/index-prod.html', 'utf-8').replace(/\d{13}/, Date.now()))