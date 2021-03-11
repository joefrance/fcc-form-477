const readXlsxFile = require('read-excel-file/node');

var myArgs = process.argv.slice(2);
if(myArgs.length < 1) {
    console.log("Usage: index.js /path/to/excelfile");
    return;
}
console.log(myArgs[0]);

// File path.
readXlsxFile(myArgs[0]).then((rows) => {
  // `rows` is an array of rows
  // each row being an array of cells.
  for(var ix=0; ix < rows.length; ix++) {
    console.log(rows[ix]);
  }
}).catch((reason) => {
    // `rows` is an array of rows
    // each row being an array of cells.
    console.log(reason);
  })