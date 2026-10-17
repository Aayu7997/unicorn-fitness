import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase() || '';
    const muscle = searchParams.get('muscle')?.toLowerCase() || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filePath = path.join(process.cwd(), 'public', 'data', 'exercises.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    let exercises = JSON.parse(fileContents);

    if (muscle && muscle !== 'all') {
      exercises = exercises.filter((ex: any) => 
        ex.primaryMuscles.some((m: string) => m.toLowerCase().includes(muscle)) ||
        ex.secondaryMuscles.some((m: string) => m.toLowerCase().includes(muscle))
      );
    }

    if (search) {
      exercises = exercises.filter((ex: any) => 
        ex.name.toLowerCase().includes(search)
      );
    }

    const total = exercises.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = exercises.slice(start, end);

    return NextResponse.json({
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Failed to load exercises' }, { status: 500 });
  }
}