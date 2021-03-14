const fs = require('fs');
const readXlsxFile = require('read-excel-file/node');

var myArgs = process.argv.slice(2);
if(myArgs.length < 1) {
    console.log("Usage: index.js /path/to/excelfile");
    return;
}
//console.log(myArgs[0]);

var jsonMapping = JSON.parse(fs.readFileSync('./.address-mapping.json'));
var invalidBlockCodeFileContext = fs.readFileSync('./.invalid-block-codes.txt', 'utf8');
var invalidBlockCodeLines = invalidBlockCodeFileContext.split('\n');
var invalidBlockCodes = [];
for(var ix = 0; ix < invalidBlockCodeLines.length; ix++) {
  if(invalidBlockCodeLines[ix].indexOf('Row Number:') > -1) {
    var parts = invalidBlockCodeLines[ix].split(' ');
    invalidBlockCodes.push(parts[parts.length - 1].trim());
  }
}

var acceptedRecords = [];
var rejectedRecords = [];
var blockCodes = [];
// File path.
readXlsxFile(myArgs[0]).then((rows) => {
  // `rows` is an array of rows
  // each row being an array of cells.
  var startRecord = jsonMapping.spreadsheetFormat.firstRowContainsHeadings ? 1 : 0;
  for(var ix = startRecord; ix < rows.length; ix++) {
    var consumerFlag = rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.zip] === 37312 ? '0' : '1';
    var businessFlag = rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.zip] === 37312 ? '1' : '0';

    record = {
      censusBlock: stripNull(rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.censusBlock]),
      latitude: jsonMapping.spreadsheetFormat.fieldMappings.latitude ? rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.latitude] : null,
      longitude: jsonMapping.spreadsheetFormat.fieldMappings.longitude ? rows[ix][jsonMapping.spreadsheetFormat.fieldMappings.longitude] : null,
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
      maximumDownstreamConsumer: consumerFlag === '0' ? 0 : jsonMapping.form477.maximumDownstreamConsumer,
      maximumUpstreamConsumer: consumerFlag === '0' ? 0 : jsonMapping.form477.maximumUpstreamConsumer,
      businessGovernment: businessFlag, // jsonMapping.form477.businessGovernment,
    };

    var reject =
    stripNull(record.state).toLowerCase() !== 'tn'
    || record.censusBlock === ''
    || invalidBlockCodes.includes(record.censusBlock.toString())
    || businessFlag === '1'

    if(reject) {rejectedRecords.push(record); }
    else { acceptedRecords.push(record) }

    if(record.censusBlock !== '' && !blockCodes.includes(record.censusBlock)) {
      blockCodes.push(record.censusBlock);
    }

  }
  var acceptedLines = [];
  for(var aix = 0; aix < acceptedRecords.length; aix++) {
    acceptedLines.push(`${acceptedRecords[aix].censusBlock},${acceptedRecords[aix].providersDbaName},${acceptedRecords[aix].technologyOfTransmission},${acceptedRecords[aix].consumer},${acceptedRecords[aix].maximumDownstreamConsumer},${acceptedRecords[aix].maximumUpstreamConsumer},${acceptedRecords[aix].businessGovernment}`)
  }

  var uniqueAcceptedRecords = acceptedLines.filter((v, i, a) => a.indexOf(v) === i);
  //console.log(`${uniqueRecords.length} ${acceptedRecords.length}`)
  for(var aix = 0; aix < uniqueAcceptedRecords.length; aix++) {
    console.log(`${uniqueAcceptedRecords[aix]}`)
  }

  var metrics = {
    totalRecords: rows.length,
    uniqueAcceptedRecordsCount: uniqueAcceptedRecords.length,
    allUniqueBlockCodesCount: blockCodes.length,
    rejectedRecordsRules: "businessFlag = '1' (Don't include business). record.state not in TN. record.censusBlock not blank and not invalid per 477 site.",
    rejectedRecordsCount: rejectedRecords.length,
    invalidBlockCodesDescription: "These code blocks were marked as invalid by the 477 site and stored in the .invalid-block-codes.txt file. See .invalid-block-codes-sample.txt for example rejects from 477 site.",
    invalidBlockCodesCount: invalidBlockCodes.length,
    rejectedRecords: rejectedRecords.sort(function(a, b){
      if(a.censusBlock < b.censusBlock) { return -1; }
      if(a.censusBlock > b.censusBlock) { return 1; }
      return 0;
    }),
    acceptedRecords: acceptedRecords.sort(function(a, b){
      if(a.censusBlock < b.censusBlock) { return -1; }
      if(a.censusBlock > b.censusBlock) { return 1; }
      return 0;
    }),
    uniqueAcceptedRecords: uniqueAcceptedRecords,
    allUniqueBlockCodes: blockCodes,
    invalidBlockCodes: invalidBlockCodes
  };

  fs.writeFileSync('./.metrics.json', JSON.stringify(metrics, null, 2));

  //console.log(acceptedRecords);
  //console.log("acceptedRecords", acceptedRecords.length);
  // for(var aix = 0; aix < acceptedRecords.length; aix++) {
  //   console.log(`${acceptedRecords[aix].censusBlock},${acceptedRecords[aix].providersDbaName},${acceptedRecords[aix].technologyOfTransmission},${acceptedRecords[aix].consumer},${acceptedRecords[aix].maximumDownstreamConsumer},${acceptedRecords[aix].maximumUpstreamConsumer},${acceptedRecords[aix].businessGovernment}`)
  // }
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