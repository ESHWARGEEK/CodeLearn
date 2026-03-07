import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return NextResponse.json({
    progress: {
      completedLessons: 0,
      totalLessons: 0,
      currentLevel: 'Beginner'
    }
  });
}