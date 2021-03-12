const fs = require('fs');
const readXlsxFile = require('read-excel-file/node');

var myArgs = process.argv.slice(2);
if(myArgs.length < 1) {
    console.log("Usage: index.js /path/to/excelfile");
    return;
}
//console.log(myArgs[0]);

var jsonMapping = JSON.parse(fs.readFileSync('./.address-mapping.json'));

var acceptedRecords = [];
var rejectedRecords = [];
// File path.
readXlsxFile(myArgs[0]).then((rows) => {
  // `rows` is an array of rows
  // each row being an array of cells.
  var startRecord = jsonMapping.spreadsheetFormat.firstRowContainsHeadings ? 1 : 0;
  for(var ix = startRecord; ix < rows.length; ix++) {
    var consumerFlag = rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.zip] === 37312 ? '0' : '1';
    var businessFlag = rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.zip] === 37312 ? '1' : '0';

    record = {
      censusBlock: rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.censusBlock],
      name: rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.name],
      firstName: rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.firstName],
      lastName: rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.lastName],
      address: cleanAddress(rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.address1], rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.address2]),
      state: rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.state],
      city: rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.city],
      zip: rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.zip],
      providersDbaName: jsonMapping.form477.providersDbaName,
      technologyOfTransmission: jsonMapping.form477.technologyOfTransmission,
      consumer: consumerFlag, // jsonMapping.form477.consumer,
      maximumDownstreamConsumer: jsonMapping.form477.maximumDownstreamConsumer,
      maximumUpstreamConsumer: jsonMapping.form477.maximumUpstreamConsumer,
      businessGovernment: businessFlag, // jsonMapping.form477.businessGovernment,
    };

    var reject =
    stripNull(record.state).toLowerCase() !== 'tn'
    || record.censusBlock === null
    //&& businessFlag === '0'

    if(reject) { rejectedRecords.push(record); }
    else { acceptedRecords.push(record) }
  }

  //console.log(acceptedRecords);
  //console.log("acceptedRecords", acceptedRecords.length);
  for(var aix = 0; aix < acceptedRecords.length; aix++) {
    console.log(`${acceptedRecords[aix].censusBlock},${acceptedRecords[aix].providersDbaName},${acceptedRecords[aix].technologyOfTransmission},${acceptedRecords[aix].consumer},${acceptedRecords[aix].maximumDownstreamConsumer},${acceptedRecords[aix].maximumUpstreamConsumer},${acceptedRecords[aix].businessGovernment}`)
  }
}).catch((reason) => {
    // `rows` is an array of rows
    // each row being an array of cells.
    console.log(reason);
  })

function cleanAddress(address1, address2) {
  //console.log(address1, address2);

  var address = (address1 !== undefined) ? address1.trim() : "";
  if((address2 !== undefined) && (address2 !== null)) {
    address += (' ' + address2).trim();
  }

  return address;
}

function stripNull(value) {
  if(value === undefined) return '';
  if(value === null) return '';

  return value;
}