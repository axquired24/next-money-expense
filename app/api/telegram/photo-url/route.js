import { NextResponse } from "next/server"
import useTelegram from '@/src/hooks/useTelegram';

export async function POST(req) {
  const { getFileUrl } = useTelegram();
  
  const body = await req.json()

  try {
    const fileUrl = await getFileUrl(body?.file_id)
    return NextResponse.json({
      url: fileUrl
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ msg: "An error occurred", error }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic' // defaults to auto
