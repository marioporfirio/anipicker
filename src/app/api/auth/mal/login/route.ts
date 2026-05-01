import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const redirectUri = `${origin}/api/auth/mal/callback`;

  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');

  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 10,
    path: '/',
  };

  cookieStore.set('mal_oauth_state', state, cookieOpts);
  cookieStore.set('mal_code_verifier', codeVerifier, cookieOpts);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.MAL_CLIENT_ID!,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeVerifier,
    code_challenge_method: 'plain',
  });

  return NextResponse.redirect(
    `https://myanimelist.net/v1/oauth2/authorize?${params.toString()}`
  );
}
