import { NextRequest, NextResponse } from 'next/server';
import { getMatch } from '@/lib/scoreAggregator';
import { generateCatchUp } from '@/lib/aiCatchUp';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { lastVisit } = await request.json();

    if (!lastVisit) {
      return NextResponse.json({ error: 'lastVisit required' }, { status: 400 });
    }

    const match = await getMatch(id);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const catchup = await generateCatchUp(match, lastVisit);
    return NextResponse.json({ catchup });
  } catch (err) {
    console.error('[API /catchup] Error:', err);
    return NextResponse.json({ error: 'Failed to generate catch-up' }, { status: 500 });
  }
}
