/** ImpactJobs public read-only feed. Deploy as a web app: execute as owner, access Anyone. */
const SPREADSHEET_ID = '1SxlxuNUPxVC40lTI3Z7VpJKjFeExBqvVO0dNd0Na3Rc';
function publicRows_(sheet, fields) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues().map(row => row.map(value => value instanceof Date ? Utilities.formatDate(value, sheet.getParent().getSpreadsheetTimeZone(), 'yyyy-MM-dd') : String(value))); 
  const headers = values.shift().map(value => value.trim());
  if (!headers.includes('Status')) return [];
  return values.filter(row => row.some(Boolean)).map(row => {
    const result = {};
    fields.forEach(field => { const index = headers.indexOf(field); if (index !== -1) result[field] = row[index]; });
    return result;
  }).filter(row => String(row.Status).trim().toLowerCase() === 'published');
}
function doGet() {
  try {
    const book = SpreadsheetApp.openById(SPREADSHEET_ID);
    const jobSheet = book.getSheets().find(sheet => {
      if (sheet.getLastRow() < 1) return false;
      const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0].map(String);
      return headers.includes('ID') && headers.includes('Title') && headers.includes('Apply URL');
    });
    if (!jobSheet) throw new Error('Jobs tab missing');
    const jobs = publicRows_(jobSheet, ['ID','Title','Company','Company Logo','Job Description','Required Skills','What We Offer','Job Type','Urgency','Location','Date Posted','Expiration Date','Salary','Company Founded','Company Email','Company Website','Company Address','Apply URL','Source','Status','Category','Experience']);
    const ads = publicRows_(book.getSheetByName('Ads'), ['ID','Title','Sponsor','Description','Image URL','Target URL','CTA Text','Placement','Start Date','End Date','Status']);
    return ContentService.createTextOutput(JSON.stringify({jobs, ads})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error:'Data source unavailable'})).setMimeType(ContentService.MimeType.JSON);
  }
}
/** Run once in the editor; adds missing columns and the Ads tab without replacing existing cells. */
function setupImpactJobs() {
  const book = SpreadsheetApp.openById(SPREADSHEET_ID);
  const jobs = book.getSheets().find(sheet => sheet.getLastColumn() && sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0].includes('Apply URL'));
  if (!jobs) throw new Error('No job tab with an Apply URL header found');
  const headers = jobs.getRange(1,1,1,jobs.getLastColumn()).getDisplayValues()[0];
  ['Category','Experience'].forEach(name => { if (!headers.includes(name)) { jobs.getRange(1,jobs.getLastColumn()+1).setValue(name); headers.push(name); } });
  let ads = book.getSheetByName('Ads');
  const fields = ['ID','Title','Sponsor','Description','Image URL','Target URL','CTA Text','Placement','Start Date','End Date','Status'];
  if (!ads) ads = book.insertSheet('Ads');
  if (ads.getLastRow() === 0) ads.getRange(1,1,1,fields.length).setValues([fields]);
  ads.setFrozenRows(1);
}
