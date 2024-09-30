import { NextResponse } from "next/server";
import useEnv from '@/src/hooks/useEnv';

const fs = require('fs');

const {getEnv} = useEnv();

export async function GET() {
  // Read the content of package.json
  const packageJsonContent = fs.readFileSync('./package.json', 'utf8');
  // Parse the JSON data
  const packageInfo = JSON.parse(packageJsonContent);
  // Access the version property
  const version = packageInfo.version;

  return NextResponse.json({
    env: getEnv(),
    version
  })
}
