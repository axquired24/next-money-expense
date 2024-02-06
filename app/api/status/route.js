import { NextResponse } from "next/server";
import useEnv from '@/src/hooks/useEnv';

const {getEnv} = useEnv();

export async function GET() {
  return NextResponse.json({
    env: getEnv()
  })
}
