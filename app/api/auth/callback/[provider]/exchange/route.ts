import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { provider: string } }) {
  return NextResponse.json({
    success: false,
    error: 'OAuth exchange not available in minimal deployment'
  });
}
