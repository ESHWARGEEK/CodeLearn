import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskArn: string } }
) {
  return NextResponse.json({
    success: false,
    error: 'Task status not available in minimal deployment'
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskArn: string } }
) {
  return NextResponse.json({
    success: false,
    error: 'Task stopping not available in minimal deployment'
  });
}
