import { NextResponse } from 'next/server';

// Technology data - can be moved to DynamoDB later
const TECHNOLOGIES = [
  {
    id: 'react',
    name: 'React',
    description: 'Build modern user interfaces with the most popular JavaScript library',
    icon: '⚛️',
    projectCount: 12,
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    description: 'Full-stack React framework with server-side rendering and API routes',
    icon: '▲',
    projectCount: 8,
  },
  {
    id: 'vue',
    name: 'Vue.js',
    description: 'Progressive JavaScript framework for building user interfaces',
    icon: '💚',
    projectCount: 10,
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'Build scalable backend applications with JavaScript',
    icon: '🟢',
    projectCount: 15,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'JavaScript with syntax for types - build more robust applications',
    icon: '🔷',
    projectCount: 9,
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Versatile language for web development, data science, and automation',
    icon: '🐍',
    projectCount: 14,
  },
  {
    id: 'express',
    name: 'Express.js',
    description: 'Fast, minimalist web framework for Node.js',
    icon: '🚂',
    projectCount: 11,
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework for rapid UI development',
    icon: '🎨',
    projectCount: 7,
  },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        technologies: TECHNOLOGIES,
      },
    });
  } catch (error) {
    console.error('Error fetching technologies:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch technologies',
        },
      },
      { status: 500 }
    );
  }
}
