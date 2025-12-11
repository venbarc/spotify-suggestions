import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback';
  
  const state = Math.random().toString(36).substring(7);
  const scopes = ['user-read-private', 'user-read-email', 'user-top-read'];
  
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('client_id', clientId!);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', scopes.join(' '));
  authUrl.searchParams.append('state', state);

  return NextResponse.json({ 
    url: authUrl.toString(),
    state 
  });
}
