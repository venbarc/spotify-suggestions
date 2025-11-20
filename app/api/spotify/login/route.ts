import { NextResponse } from 'next/server';

export async function GET() {
  // Ensure NEXT_PUBLIC_BASE_URL is set (e.g. http://localhost:3000)
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/spotify/callback`;
  const scopes = ['user-top-read'].join(' ');
  if (!clientId || !process.env.NEXT_PUBLIC_BASE_URL) {
    return new Response(JSON.stringify({ error: 'Server not configured for Spotify OAuth' }), { status: 500 });
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
  });

  const url = `https://accounts.spotify.com/authorize?${params.toString()}`;

  return NextResponse.json({ url });
}