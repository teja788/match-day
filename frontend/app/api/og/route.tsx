import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getScores, getMatch } from '@/lib/scoreAggregator';
import { resolveSlugToId } from '@/lib/slugify';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sport = request.nextUrl.searchParams.get('sport');
  const slug = request.nextUrl.searchParams.get('slug');

  if (!sport || !slug) {
    return new ImageResponse(
      <DefaultOG />,
      { width: 1200, height: 630 }
    );
  }

  try {
    await getScores(sport);
    const matchId = resolveSlugToId(sport, slug);
    const match = matchId ? await getMatch(matchId) : null;

    if (!match) {
      return new ImageResponse(
        <DefaultOG />,
        { width: 1200, height: 630 }
      );
    }

    const isLive = match.status === 'live';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#0F1117',
            padding: '60px',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Tournament */}
          <div style={{ display: 'flex', color: '#9CA3AF', fontSize: 24, marginBottom: 20 }}>
            {match.tournament}
          </div>

          {/* Live badge */}
          {isLive && (
            <div
              style={{
                display: 'flex',
                backgroundColor: '#EF4444',
                color: 'white',
                padding: '6px 20px',
                borderRadius: 20,
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 30,
                letterSpacing: 2,
              }}
            >
              LIVE
            </div>
          )}

          {/* Scores */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 40,
              marginBottom: 30,
            }}
          >
            {/* Team A */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: 'white', fontSize: 36, fontWeight: 'bold' }}>
                {match.teamA.shortName || match.teamA.name}
              </div>
              <div style={{ color: isLive ? '#F9FAFB' : '#D1D5DB', fontSize: 42, fontWeight: 'bold', marginTop: 10 }}>
                {match.teamA.score}
              </div>
            </div>

            <div style={{ color: '#4B5563', fontSize: 32, fontWeight: 'bold' }}>vs</div>

            {/* Team B */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: 'white', fontSize: 36, fontWeight: 'bold' }}>
                {match.teamB.shortName || match.teamB.name}
              </div>
              <div style={{ color: isLive ? '#F9FAFB' : '#D1D5DB', fontSize: 42, fontWeight: 'bold', marginTop: 10 }}>
                {match.teamB.score}
              </div>
            </div>
          </div>

          {/* Headline */}
          {match.headline && (
            <div style={{ display: 'flex', color: '#F59E0B', fontSize: 22, textAlign: 'center', maxWidth: 900 }}>
              {match.headline}
            </div>
          )}

          {/* Branding */}
          <div style={{ display: 'flex', position: 'absolute', bottom: 40, right: 60, color: '#6B7280', fontSize: 20 }}>
            MatchDay
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      }
    );
  } catch {
    return new ImageResponse(
      <DefaultOG />,
      { width: 1200, height: 630 }
    );
  }
}

function DefaultOG() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#0F1117',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', color: 'white', fontSize: 64, fontWeight: 'bold' }}>
        Match<span style={{ color: '#F59E0B' }}>Day</span>
      </div>
      <div style={{ display: 'flex', color: '#9CA3AF', fontSize: 28, marginTop: 16 }}>
        Live Cricket & Football Scores
      </div>
    </div>
  );
}
