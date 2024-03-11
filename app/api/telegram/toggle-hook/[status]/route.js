import { NextResponse } from "next/server"
import useTelegram from '@/src/hooks/useTelegram';

export async function GET(req, {params}) {
  const {removeWebhook, enableWebhook} = useTelegram();
  
  if (params.status === 'enable') {
    try {
      const resp = await enableWebhook();
      return NextResponse.json({status: 'Webhook Enabled', resp}, { status: 200 });
    } catch (e) {
      return NextResponse.json({status: 'Webhook Enabled', resp: e?.response?.data}, { status: 400 });
    }
  } else if (params.status === 'disable') {
    try {
      const resp = await removeWebhook();
      return NextResponse.json({status: 'Webhook Disabled', resp}, { status: 200 });
    } catch (e) {
      return NextResponse.json({status: 'Webhook Disabled', resp: e?.response?.data}, { status: 400 });
    }
  } else {
    return NextResponse.json({status: 'Invalid status'}, { status: 400 });
  }
  // await removeWebhook();
  return NextResponse.json({status: params.status}, { status: 200 });

  try {
    const resp = await fetchTelegramMessage()
    // const message = await fetchTelegramMessage();
    return NextResponse.json(resp, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ msg: "An error occurred", error }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic' // defaults to auto
