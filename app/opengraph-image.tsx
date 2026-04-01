import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Chronicle — A daily history guessing game';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          padding: '60px',
        }}
      >
        {/* Pillar icon */}
        <div
          style={{
            fontSize: 80,
            marginBottom: 32,
            lineHeight: 1,
          }}
        >
          🏛️
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: '#0f0f1a',
            letterSpacing: '-2px',
            marginBottom: 20,
            fontFamily: 'Georgia, serif',
          }}
        >
          Chronicle
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: '#555566',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
          }}
        >
          A daily history guessing game
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            color: '#aaaacc',
            fontSize: 24,
            fontFamily: 'Georgia, serif',
          }}
        >
          thischronicle.com
        </div>
      </div>
    ),
    { ...size }
  );
}
