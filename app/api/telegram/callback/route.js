import { NextResponse } from "next/server"
import useTelegram from '@/src/hooks/useTelegram';

export async function POST(req) {
  const { processTelegramCallback } = useTelegram();
  
  const body = await req.json()

  try {
    const resp = await processTelegramCallback(body)
    // const message = await fetchTelegramMessage();
    return NextResponse.json(resp, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ msg: "An error occurred", error }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic' // defaults to auto
