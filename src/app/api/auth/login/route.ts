import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex');

  const cookieStore = await cookies();
  cookieStore.set('anilist_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });

  const params = new URLSearchParams({
    client_id: process.env.ANILIST_CLIENT_ID!,
    redirect_uri: process.env.ANILIST_REDIRECT_URI!,
    response_type: 'code',
    state,
  });

  return NextResponse.redirect(
    `https://anilist.co/api/v2/oauth/authorize?${params.toString()}`
  );
}
