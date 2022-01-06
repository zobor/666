const sass = require('node-sass');
const fs = require('fs');
const path = require('path');
const file = path.resolve("./src/index.scss");

fs.writeFileSync('./src/index.css', sass.renderSync({ file }).css.toString());