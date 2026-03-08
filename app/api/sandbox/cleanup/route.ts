import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Sandbox cleanup not available in minimal deployment'
  });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Sandbox cleanup status not available in minimal deployment'
  });
}
