import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';

const GEMINI_CONFIG = {
  API_KEY: process.env.GEMINI_API_KEY,
  MODEL: 'gemini-1.5-flash'
};

async function getImageBufferFromUrl(url) {
  try {
    console.log("getImageBufferFromUrl", url)
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'arraybuffer',
      timeout: 30000 // 30 seconds timeout
    });
    
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('Error getImageBufferFromUrl:', error.message);
    throw new Error(`Error getImageBufferFromUrl: ${error.message}`);
  }
}

/**
 * Extracts receipt data from an image URL
 * @param {string} imageUrl - The URL of the receipt image
 * @returns {Promise<string[]>} Array of extracted receipt items
 * @throws {Error} If there's an error processing the image
 */
export async function extractReceiptData(imageUrl) {
  try {
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    // Download image
    const imageBuffer = await getImageBufferFromUrl(imageUrl);

    // Convert image to base64 and detect MIME type
    const fileType = await fileTypeFromBuffer(imageBuffer);
    if (!fileType) {
      throw new Error('Could not determine file type');
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_CONFIG.MODEL,
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 32,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `Extract items and prices from this receipt with the following format (round to 1 decimal place, separate by newline):
- Use "-" for expenses and positive numbers for discounts/vouchers
- Add "#pio" for baby-related items
- If not a receipt or not found any item in the receipt, return only "kosong"

Example output:
-30.5k Zwitsal Baby Soap #pio
-13k Grand Mineral Gallon
-10k baby snack milna #pio
3.1k zwitsal voucher`;

    // Convert image to base64
    const base64Image = imageBuffer.toString('base64');
    const mimeType = fileType.mime;
    
    // Process with Gemini
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: base64Image, mimeType } }
    ]);

    const response = result.response;
    const text = response.text();

    // Format results into array and clean up
    const formattedResult = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');

    return formattedResult.length > 0 ? formattedResult : ["kosong"];
    
  } catch (error) {
    console.error('Error extractReceiptData:', error.message);
    throw new Error(`Error extractReceiptData: ${error.message}`);
  }
}

// Example usage:
// (async () => {
//   try {
//     const result = await extractReceiptData('https://example.com/receipt.jpg');
//     console.log('Extracted data:', result);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// })();
