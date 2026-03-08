import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.json({
    tasks: []
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.json({
    success: false,
    error: 'Task creation not available in minimal deployment'
  });
}