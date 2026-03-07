import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioSettings, updatePortfolioSettings } from '@/lib/db/portfolio-settings';
import { PortfolioSettings } from '@/types/portfolio';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: 'User ID is required',
          },
        },
        { status: 400 }
      );
    }

    const settings = await getPortfolioSettings(userId);

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Portfolio settings GET error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch portfolio settings',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();

    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: 'User ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate request body
    const { isPublic, showGithubLinks, showTechStack, customDescription } = body;

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'isPublic must be a boolean',
          },
        },
        { status: 400 }
      );
    }

    const settings: PortfolioSettings = {
      isPublic,
      showGithubLinks: showGithubLinks ?? true,
      showTechStack: showTechStack ?? true,
      customDescription: customDescription || undefined,
    };

    await updatePortfolioSettings(userId, settings);

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Portfolio settings PUT error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update portfolio settings',
        },
      },
      { status: 500 }
    );
  }
}