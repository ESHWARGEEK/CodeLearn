import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return NextResponse.json({
    usage: {
      apiCalls: 0,
      storageUsed: 0,
      computeTime: 0
    }
  });
}