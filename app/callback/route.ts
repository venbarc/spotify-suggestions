import { NextRequest, NextResponse } from 'next/server';

const AUTHORIZED_EMAILS = [
  process.env.SPOTIFY_AUTHORIZED_EMAIL || 'bentf24@gmail.com'
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // Redirect back to home with error
      return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || `${request.nextUrl.origin}/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      }).toString()
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token exchange failed:', error);
      return NextResponse.redirect(new URL('/?error=token_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user profile
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL('/?error=profile_failed', request.url));
    }

    const userData = await userResponse.json();
    const userEmail = userData.email;

    // Check if user is authorized
    const isAuthorized = AUTHORIZED_EMAILS.includes(userEmail);

    if (!isAuthorized) {
      // Redirect with unauthorized flag
      return NextResponse.redirect(new URL('/?auth=unauthorized', request.url));
    }

    // Get user's top artists
    const topArtistsResponse = await fetch(
      'https://api.spotify.com/v1/me/top/artists?limit=1',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!topArtistsResponse.ok) {
      return NextResponse.redirect(new URL('/?auth=success', request.url));
    }

    const topArtistsData = await topArtistsResponse.json();
    const topArtist = topArtistsData.items?.[0];

    if (topArtist) {
      // Encode artist data to pass via URL
      const artistData = encodeURIComponent(JSON.stringify({
        id: topArtist.id,
        name: topArtist.name,
        image: topArtist.images?.[0]?.url,
        popularity: topArtist.popularity
      }));
      
      return NextResponse.redirect(new URL(`/?auth=success&artist=${artistData}`, request.url));
    }

    return NextResponse.redirect(new URL('/?auth=success', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
