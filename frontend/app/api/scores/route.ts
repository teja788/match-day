import { NextRequest, NextResponse } from 'next/server';
import { getScores } from '@/lib/scoreAggregator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sport = request.nextUrl.searchParams.get('sport') || undefined;
    const data = await getScores(sport);
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API /scores] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}
