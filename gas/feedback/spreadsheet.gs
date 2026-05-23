function getSheetByService(service) {
  const ss = SpreadsheetApp.openById(getSpreadsheetId());
  const sheet = ss.getSheetByName(service);
  if (!sheet) throw new Error(`Sheet not found for service: ${service}`);
  return sheet;
}

function appendPendingRow(service, message, userAgent, ipHash) {
  const sheet = getSheetByService(service);
  const timestamp = new Date();
  sheet.appendRow([timestamp, service, message, userAgent, ipHash, 'pending', '']);
  return sheet.getLastRow();
}

function updateSlackStatus(service, rowNumber, status) {
  const sheet = getSheetByService(service);
  sheet.getRange(rowNumber, 6).setValue(status);
}

function sha256Hex(input) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
  return bytes.map(b => {
    const v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}
