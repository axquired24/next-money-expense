import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import axios from 'axios';

const GEMINI_CONFIG = {
  API_KEY: process.env.GEMINI_API_KEY,
  MODEL: 'gemini-1.5-flash'
};

async function getImageBufferFromTelegram(url) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer'
    });
    
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('Error downloading image from Telegram:', error);
    throw new Error('Failed to download image from Telegram');
  }
}

export async function POST(req) {
  try {
    const { imageUrl, date } = await req.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { message: 'Image URL is required' }, 
        { status: 400 }
      );
    }

    // Download image from Telegram
    const imageBuffer = await getImageBufferFromTelegram(imageUrl);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });

    const prompt = `Ekstrak item dan harga barang dari receipt digambar ini dengan format dibawah ini (bulatkan 1 angka dibelakang desimal, pisahkan dengan enter)
sertakan "-" untuk pengeluaran, dan gunakan angka positif untuk diskon/voucher. Apabila ada item yang berhubungan dengan bayi (Sabun bayi, shampo bayi, pampers, snack bayi maka tambahkan "#pio" di label deskripsi)

Expektasi hasil:
-30,5k Zwitsal Sabun Mandi #pio
-13k Grand Mineral Galon
-10k snack milna bayi #pio
3,1k voucher zwitsal

Diluar scope:
Cek jenis file, apabila bukan nota maka kembalikan "bukan-nota"`;

    // Convert image to base64
    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg';
    
    // Process with Gemini
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: base64Image, mimeType } }
    ]);

    const response = result.response;
    const text = response.text();

    // Format results into array
    const formattedResult = text.split('\n').filter(line => line.trim() !== '');

    return NextResponse.json({
      message: 'Nota berhasil diproses!',
      date: date || null,
      extractedData: formattedResult,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing receipt:', error);
    return NextResponse.json(
      { 
        message: 'Terjadi kesalahan saat memproses gambar', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
