// Temporary debug endpoint to verify files exist in Vercel deployment
import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  const checks = {
    'lib/auth/auth-context.tsx': existsSync(join(process.cwd(), 'lib/auth/auth-context.tsx')),
    'components/shared/Navbar.tsx': existsSync(join(process.cwd(), 'components/shared/Navbar.tsx')),
    'src/lib/auth/auth-context.tsx': existsSync(join(process.cwd(), 'src/lib/auth/auth-context.tsx')),
    'src/components/shared/Navbar.tsx': existsSync(join(process.cwd(), 'src/components/shared/Navbar.tsx')),
    'lib directory': existsSync(join(process.cwd(), 'lib')),
    'components directory': existsSync(join(process.cwd(), 'components')),
    'src directory': existsSync(join(process.cwd(), 'src')),
    'cwd': process.cwd(),
  };

  return NextResponse.json(checks);
}
