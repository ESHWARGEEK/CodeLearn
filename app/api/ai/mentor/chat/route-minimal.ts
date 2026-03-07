import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    response: 'AI Mentor is not available in minimal deployment mode.',
    suggestions: [],
    context: {}
  });
}