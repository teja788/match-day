import { NextRequest, NextResponse } from 'next/server';
import { getMatch } from '@/lib/scoreAggregator';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await getMatch(id);

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (err) {
    console.error('[API /scores/:id] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 });
  }
}
