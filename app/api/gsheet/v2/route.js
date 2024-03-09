import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const auth = new google.auth.JWT(
  process.env.CLIENT_EMAIL,
  null,
  process.env.PRIVATE_KEY,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

// Specify the spreadsheet ID and range
const spreadsheetId = '1pJCNxQi2uNCr6hWZuQDdvdczwnFAT3ZZ1DuBZCTwqZg';

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
  const header = [['Date', 'Amount', 'Description', 'Category']];
  const range = `${sheetName}!A1:D1`;
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

export async function GET(req, res, next) {
  // Load the credentials from a JSON file

  // Check if the sheet "Month Year" exists
  const currentDate = new Date();
  const month = currentDate.toLocaleString('default', { month: 'short' });
  const year = currentDate.getFullYear();
  const sheetName = `Cash ${month} ${year}`;

  const sheetExists = await checkSheetExists(sheets, spreadsheetId, sheetName);

  if (!sheetExists) {
    // Create the sheet "Month Year" if it doesn't exist
    await createSheet(sheets, spreadsheetId, sheetName);
    await initSheet(sheets, spreadsheetId, sheetName);
  } // endif

  // Define the new data to be added
  const newData = [
    ['2022-01-01', Math.floor(Math.random() * 900) + 1000, 'Apples'],
    ['2022-01-02', Math.floor(Math.random() * 900) + 1000, 'Bananas'],
    ['2022-01-03', Math.floor(Math.random() * 900) + 1000, 'Milk']
  ];

  try {
    // Append the new data to the spreadsheet
    // Detect the last row in the sheet
    const lastRow = await getLastRow(sheets, spreadsheetId, sheetName);
    
    // Calculate the range for the new data
    const startRow = lastRow + 1;
    const endRow = startRow + newData.length - 1;
    const range = `${sheetName}!A${startRow}:C${endRow}`;
    // Append the new data to the spreadsheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values: newData },
    });

    return NextResponse.json({ message: 'GET request handled successfully', status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding data' });
  }
}
