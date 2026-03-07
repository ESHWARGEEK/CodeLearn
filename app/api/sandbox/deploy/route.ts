import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Deployment not available in minimal deployment'
  });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Deployment status not available in minimal deployment'
  });
}
