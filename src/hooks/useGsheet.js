import { google } from 'googleapis';

const useGsheet = () => {
  const auth = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  let spreadsheetId = process.env.SPREADSHEET_ID;
  
  const sheets = google.sheets({ version: 'v4', auth });

  const setSpreadsheetId = (id) => {
    spreadsheetId = id;
  };

  async function checkSheetExists(sheets, spreadsheetId, sheetName) {
    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        ranges: [sheetName],
      });
      const sheetExists = response.data.sheets.length > 0;
      return sheetExists;
    } catch (error) {
      console.error(`Error checking if sheet "${sheetName}" exists:`, error);
      return false;
    }
  }
  
  async function getLastRow(sheets, spreadsheetId, sheetName) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });
    const values = response.data.values;
    if (values && values.length > 0) {
      return values.length;
    } else {
      return 0;
    }
  }
  
  async function createSheet(sheets, spreadsheetId, sheetName) {
    // Implement the logic to create a new sheet
    const request = {
      spreadsheetId,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    };
    try {
      const response = await sheets.spreadsheets.batchUpdate(request);
      console.log(`Sheet "${sheetName}" created successfully.`);
    } catch (error) {
      console.error(`Error creating sheet "${sheetName}":`, error);
    }
  }
  
  async function initSheet(sheets, spreadsheetId, sheetName) {
    const header = [['Date', 'Amount', 'Description', 'Category', 'Utang?', 'Notes']];
    const range = `${sheetName}!A1:F1`;
    try {
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: header },
      });
      console.log(`Sheet "${sheetName}" initialized successfully.`);
    } catch (error) {
      console.error(`Error initializing sheet "${sheetName}":`, error);
    }
  }

  function generateSheetName() {
    // Check if the sheet "Month Year" exists
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'short' });
    const year = currentDate.getFullYear();
    return `Cashbot ${month} ${year}`;
  }
  
  async function addToSheet({rows=[], sheetName=null}) {
    if(! sheetName) {
      sheetName = generateSheetName()
    } // endif

    const sheetExists = await checkSheetExists(sheets, spreadsheetId, `${sheetName}!A1:F2`);
  
    if (!sheetExists) {
      // Create the sheet "Month Year" if it doesn't exist
      await createSheet(sheets, spreadsheetId, sheetName);
      await initSheet(sheets, spreadsheetId, sheetName);
    } // endif
  
    try {
      // Append the new data to the spreadsheet
      // Detect the last row in the sheet
      const lastRow = await getLastRow(sheets, spreadsheetId, sheetName);
      
      // Calculate the range for the new data
      const startRow = lastRow + 1;
      const endRow = startRow + rows.length - 1;
      const range = `${sheetName}!A${startRow}:D${endRow}`;
      // Append the new data to the spreadsheet
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: rows },
      });
  
      return true
    } catch (error) {
      console.error(`Error adding data to sheet "${sheetName}":`, error);
      return false
    }
  }

  return {
    generateSheetName,
    setSpreadsheetId,
    addToSheet
  }
}

export default useGsheet;
