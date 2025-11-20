import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    if (error) {
      return new Response('Spotify auth error', { status: 400 });
    }
    if (!code) {
      return new Response('Missing code', { status: 400 });
    }

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/spotify/callback`,
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error('Token exchange failed', text);
      return new Response('Token exchange failed', { status: 500 });
    }

    const tokenData = await tokenRes.json();
    // Store tokens in an httpOnly cookie (URL-encoded JSON)
    const cookieValue = encodeURIComponent(JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
    }));

    const res = NextResponse.redirect(new URL('/', request.url));
    // Max-Age set to token expiry (seconds) — keep cookie long-ish for refresh flows
    res.headers.set('Set-Cookie', `spotify_auth=${cookieValue}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`);
    return res;
  } catch (err) {
    console.error('Spotify callback error', err);
    return new Response('Spotify callback error', { status: 500 });
  }
}