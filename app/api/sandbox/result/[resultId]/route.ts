import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  return NextResponse.json({
    success: false,
    error: 'Result retrieval not available in minimal deployment'
  });
}
