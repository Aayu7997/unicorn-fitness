import { NextResponse } from 'next/server';
export function GET() {
    return NextResponse.json({ db: !!process.env.DATABASE_URL, all: Object.keys(process.env).filter(k => k.includes('DATABASE')) });
}