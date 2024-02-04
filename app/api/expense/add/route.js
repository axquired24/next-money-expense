import { NextResponse } from "next/server";
import useAirtable from '@/src/hooks/useAirtable';
import { v4 as uuidv4 } from 'uuid';

const { addRecords } = useAirtable();

async function doAddRecord (records) {
  const respData = await addRecords('expenses', records);
  return NextResponse.json(respData, {status: respData ? 200 : 500});
}

export async function POST(request) {
  const records = await request.json()
  return await doAddRecord(records)
}

export async function GET() {
  console.log(records);
  const records = [
    {
      "fields": {
        "uuid": uuidv4(),
        "date": "2024-01-30",
        "amount": -5000,
        "item_name": "Nasi Putih"
      }
    },
    {
      "fields": {
        "uuid": uuidv4(),
        "date": "2024-01-30",
        "amount": -3000,
        "item_name": "Parkir Mahal"
      }
    }
  ]

  return await doAddRecord(records)
}
