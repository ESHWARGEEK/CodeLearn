import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;

    // TODO: Fetch saved code from S3
    // For now, return a starter template
    const starterCode = `// Welcome to your project workspace!
// Start coding here...

function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet('Developer'));
`;

    return NextResponse.json({
      success: true,
      data: {
        code: starterCode,
      },
    });
  } catch (error) {
    console.error('Failed to fetch code:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_CODE_FAILED',
          message: 'Failed to fetch saved code',
        },
      },
      { status: 500 }
    );
  }
}
