// Google Sheets configuration
const SPREADSHEET_ID = '1ge3K9Hf8dKLz1VUuePXU-sF0-6dIMMZ1EnChrLYd-ek';
const API_KEY = 'AIzaSyD5nJ8GE9sR7J2hlEm5-OmbdN7eNKCVaGc';
const CLIENT_ID = '23662666057-u9nmucoi92ueossdiskcmjc0oobms26c.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Initialize gapi client
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  });
  gapiInited = true;
  maybeEnableButtons();
}

// Initialize GIS client
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.display = 'block';
  }
}

// Auth handler
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    document.getElementById('authorize_button').innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Auth';
    await loadInitialData();
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    tokenClient.requestAccessToken({prompt: ''});
  }
}

// Shared function to get sheet data
async function getSheetData(sheetName, range) {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
    });
    return response.result.values || [];
  } catch (error) {
    console.error('Error getting sheet data:', error);
    showNotification(`Failed to load ${sheetName} data`, false);
    return [];
  }
}

// Shared function to update sheet data
async function updateSheetData(sheetName, range, values) {
  try {
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
    return true;
  } catch (error) {
    console.error('Error updating sheet:', error);
    showNotification(`Failed to update ${sheetName}`, false);
    return false;
  }
}

// Initialize all
function initGoogleSheets() {
  gapiLoaded();
  gisLoaded();
  document.getElementById('authorize_button').onclick = handleAuthClick;
}
