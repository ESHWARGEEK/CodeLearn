import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.json({
    success: false,
    error: 'Project save not available in minimal deployment'
  });
}